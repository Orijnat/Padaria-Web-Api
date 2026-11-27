import { Pedido, PedidoItem, Produto, Usuario } from "../models/index.js";
import { sequelize } from "../config/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";

const includeCompleto = [
    {
        model: Usuario,
        as: 'cliente',
        attributes: ['id', 'nome', 'email', 'telefone', 'tipo']
    },
    {
        model: PedidoItem,
        as: 'itens',
        include: [{ model: Produto, as: 'produto' }]
    }
];



const ehFuncionario = (req) => req.usuario?.tipo === 'funcionario';

export const getAll = async (req, res) => {
    try {
        const filtro = ehFuncionario(req) ? {} : { clienteId: req.usuario.id };
        const pedidos = await Pedido.findAll({
            where: filtro,
            include: includeCompleto,
            order: [['id', 'DESC']]
        });
        return sucesso(res, pedidos);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar pedidos.", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id, { include: includeCompleto });
        if (!pedido) return erro(res, 404, "Pedido não encontrado.");
        if (!ehFuncionario(req) && pedido.clienteId !== req.usuario.id) {
            return erro(res, 403, "Acesso negado a este pedido.");
        }
        return sucesso(res, pedido);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar pedido.", error.message);
    }
};

export const create = async (req, res) => {
    try {
        const { clienteId, clienteNome, clienteEmail, itens, observacao } = req.body;
        let { status } = req.body;

        if (!Array.isArray(itens) || itens.length === 0) {
            return erroDeValidacao(res, { itens: "O campo 'itens' é obrigatório e deve conter ao menos um produto." });
        }

        const itensNormalizados = [];
        for (const [i, item] of itens.entries()) {
            const produtoId = Number(item?.produtoId);
            const quantidade = Number(item?.quantidade ?? 1);
            if (!Number.isInteger(produtoId) || produtoId <= 0) {
                return erroDeValidacao(res, { [`itens[${i}].produtoId`]: "produtoId inválido." });
            }
            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                return erroDeValidacao(res, { [`itens[${i}].quantidade`]: "quantidade deve ser um inteiro maior que zero." });
            }
            itensNormalizados.push({ produtoId, quantidade });
        }

        const produtos = await Produto.findAll({ where: { id: itensNormalizados.map((i) => i.produtoId) } });
        const mapaProdutos = new Map(produtos.map((p) => [p.id, p]));
        for (const item of itensNormalizados) {
            const produto = mapaProdutos.get(item.produtoId);
            if (!produto) return erro(res, 404, `Produto com id ${item.produtoId} não encontrado.`);
            if (!produto.ativo) return erroDeValidacao(res, { itens: `O produto '${produto.nome}' está inativo.` });
            item.precoUnit = Number(produto.preco);
        }

        const total = itensNormalizados.reduce((soma, item) => soma + item.precoUnit * item.quantidade, 0);

        const logado = req.usuario;
        let clienteFinal, nomeFinal = clienteNome || null, emailFinal = clienteEmail || null;
        if (logado?.tipo !== 'funcionario') {
            clienteFinal = logado.id;
            nomeFinal = logado.nome;
            emailFinal = logado.email;
            status = 'pendente';
        } else {
            clienteFinal = clienteId ?? null;
            if (clienteFinal) {
                const cliente = await Usuario.findByPk(clienteFinal);
                if (!cliente) return erro(res, 404, `Usuário com id ${clienteFinal} não encontrado.`);
                if (cliente.tipo !== 'cliente') {
                    return erroDeValidacao(res, { clienteId: "O usuário vinculado ao pedido deve ser um cliente." });
                }
                nomeFinal = nomeFinal || cliente.nome;
                emailFinal = emailFinal || cliente.email;
            }
        }

        const novoPedido = await sequelize.transaction(async (t) => {
            // Valida e debita estoque de cada produto
            for (const item of itensNormalizados) {
                const produto = mapaProdutos.get(item.produtoId);
                if (produto.estoque < item.quantidade) {
                    const err = new Error(`Estoque insuficiente para '${produto.nome}': disponível ${produto.estoque}, solicitado ${item.quantidade}.`);
                    err.estoqueInsuficiente = true;
                    err.produto = produto.nome;
                    throw err;
                }
                await produto.update(
                    { estoque: produto.estoque - item.quantidade },
                    { transaction: t }
                );
            }

            const criadoPedido = await Pedido.create({
                clienteId: clienteFinal,
                clienteNome: nomeFinal,
                clienteEmail: emailFinal,
                data: new Date(),
                status: status || 'pendente',
                total: Number(total.toFixed(2)),
                observacao: observacao || null
            }, { transaction: t });

            await PedidoItem.bulkCreate(
                itensNormalizados.map((item) => ({
                    pedidoId: criadoPedido.id,
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnit: item.precoUnit
                })),
                { transaction: t }
            );
            return criadoPedido;
        });

        const completo = await Pedido.findByPk(novoPedido.id, { include: includeCompleto });
        return criado(res, completo, "Pedido criado com sucesso.");
    } catch (error) {
        if (error.estoqueInsuficiente) {
            return erroDeValidacao(res, { estoque: error.message });
        }
        return erroDoSequelize(res, error, "Erro ao criar pedido.");
    }
};

// Máquina de estados válida para pedidos
const TRANSICOES_PEDIDO = {
    pendente: ['preparando', 'cancelado'],
    preparando: ['pronto', 'cancelado'],
    pronto: ['entregue'],
    entregue: [],
    cancelado: [],
};

export const update = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id, {
            include: [{ model: PedidoItem, as: 'itens' }]
        });
        if (!pedido) return erro(res, 404, "Pedido não encontrado.");

        const { status, observacao } = req.body;

        // Valida máquina de estados
        if (status !== undefined && status !== pedido.status) {
            const permitidos = TRANSICOES_PEDIDO[pedido.status] ?? [];
            if (!permitidos.includes(status)) {
                return erroDeValidacao(res, {
                    status: `Transição inválida: '${pedido.status}' → '${status}'. Permitidos: [${permitidos.join(', ') || 'nenhum'}].`
                });
            }
        }

        // Estorna estoque dos produtos ao cancelar pedido em transação
        if (status === 'cancelado' && pedido.status !== 'cancelado') {
            await sequelize.transaction(async (t) => {
                if (Array.isArray(pedido.itens) && pedido.itens.length > 0) {
                    const produtos = await Produto.findAll({
                        where: { id: pedido.itens.map((i) => i.produtoId) },
                        transaction: t
                    });
                    const mapaProdutos = new Map(produtos.map((p) => [p.id, p]));
                    for (const item of pedido.itens) {
                        const produto = mapaProdutos.get(item.produtoId);
                        if (produto) {
                            await produto.update(
                                { estoque: produto.estoque + item.quantidade },
                                { transaction: t }
                            );
                        }
                    }
                }

                await pedido.update({
                    status,
                    ...(observacao !== undefined && { observacao })
                }, { transaction: t });
            });

            return sucesso(res, pedido, "Pedido cancelado e estoque estornado com sucesso.");
        }

        await pedido.update({
            ...(status !== undefined && { status }),
            ...(observacao !== undefined && { observacao })
        });

        return sucesso(res, pedido, "Pedido atualizado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar pedido.");
    }
};

export const destroy = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);
        if (!pedido) return erro(res, 404, "Pedido não encontrado.");
        await pedido.destroy();
        return sucesso(res, null, "Pedido removido com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover pedido.");
    }
};

export default { getAll, getById, create, update, destroy };

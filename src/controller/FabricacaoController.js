import { Fabricacao, Produto, Funcionario, Receita, ReceitaIngrediente, Insumo } from "../models/index.js";
import { sequelize } from "../config/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";

const includeCompleto = [
    { model: Produto, as: 'produto' },
    { model: Funcionario, as: 'funcionario' }
];

export const getAll = async (req, res) => {
    try {
        const fabricacoes = await Fabricacao.findAll({
            include: includeCompleto,
            order: [['id', 'DESC']]
        });
        return sucesso(res, fabricacoes);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar ordens de fabricação.", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const fab = await Fabricacao.findByPk(req.params.id, { include: includeCompleto });
        if (!fab) return erro(res, 404, "Ordem de fabricação não encontrada.");
        return sucesso(res, fab);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar ordem de fabricação.", error.message);
    }
};

export const create = async (req, res) => {
    try {
        const { produtoId, funcionarioId, data, quantidade, status } = req.body;

        if (!produtoId) {
            return erroDeValidacao(res, { produtoId: "O campo 'produtoId' é obrigatório." });
        }

        const produto = await Produto.findByPk(produtoId);
        if (!produto) return erro(res, 404, `Produto com id ${produtoId} não encontrado.`);

        if (funcionarioId) {
            const funcionario = await Funcionario.findByPk(funcionarioId);
            if (!funcionario) return erro(res, 404, `Funcionário com id ${funcionarioId} não encontrado.`);
        }

        const nova = await Fabricacao.create({
            produtoId,
            funcionarioId: funcionarioId || null,
            data: data || new Date(),
            quantidade: quantidade !== undefined ? Number(quantidade) : 1,
            status: status || 'planejado'
        });

        return criado(res, nova, "Ordem de fabricação registrada com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao registrar ordem de fabricação.");
    }
};

// Máquina de estados válida para fabricação
const TRANSICOES_FABRICACAO = {
    planejado: ['em_producao', 'cancelado'],
    em_producao: ['concluido', 'cancelado'],
    concluido: [],
    cancelado: [],
};

export const update = async (req, res) => {
    try {
        const fab = await Fabricacao.findByPk(req.params.id);
        if (!fab) return erro(res, 404, "Ordem de fabricação não encontrada.");

        const { produtoId, funcionarioId, data, quantidade, status } = req.body;

        // Valida máquina de estados
        if (status !== undefined && status !== fab.status) {
            const permitidos = TRANSICOES_FABRICACAO[fab.status] ?? [];
            if (!permitidos.includes(status)) {
                return erroDeValidacao(res, {
                    status: `Transição inválida: '${fab.status}' → '${status}'. Permitidos: [${permitidos.join(', ') || 'nenhum'}].`
                });
            }
        }

        if (produtoId !== undefined) {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) return erro(res, 404, `Produto com id ${produtoId} não encontrado.`);
        }
        if (funcionarioId) {
            const funcionario = await Funcionario.findByPk(funcionarioId);
            if (!funcionario) return erro(res, 404, `Funcionário com id ${funcionarioId} não encontrado.`);
        }

        const qtdFabricacao = quantidade !== undefined ? Number(quantidade) : fab.quantidade;
        const prodIdFinal = produtoId !== undefined ? produtoId : fab.produtoId;

        // Se está concluindo: baixa insumos e incrementa estoque do produto em transação
        if (status === 'concluido' && fab.status !== 'concluido') {
            await sequelize.transaction(async (t) => {
                // Busca receita do produto (se houver) para baixar insumos
                const produto = await Produto.findByPk(prodIdFinal, { transaction: t });
                if (produto?.receitaId) {
                    const receita = await Receita.findByPk(produto.receitaId, {
                        include: [{ model: ReceitaIngrediente, as: 'ingredientes', include: [{ model: Insumo, as: 'insumo' }] }],
                        transaction: t,
                    });
                    if (receita?.ingredientes?.length) {
                        for (const ing of receita.ingredientes) {
                            const consumo = ing.quantidade * qtdFabricacao;
                            const insumo = ing.insumo;
                            if (!insumo) continue;
                            if (insumo.quantidadeAtual < consumo) {
                                throw Object.assign(
                                    new Error(`Estoque insuficiente de '${insumo.nome}': necessário ${consumo}, disponível ${insumo.quantidadeAtual}.`),
                                    { estoqueInsuficiente: true, insumo: insumo.nome, necessario: consumo, disponivel: insumo.quantidadeAtual }
                                );
                            }
                            await insumo.update(
                                { quantidadeAtual: parseFloat((insumo.quantidadeAtual - consumo).toFixed(4)) },
                                { transaction: t }
                            );
                        }
                    }
                }

                // Incrementa estoque do produto fabricado
                if (produto) {
                    await produto.update(
                        { estoque: produto.estoque + Math.round(qtdFabricacao) },
                        { transaction: t }
                    );
                }

                await fab.update({
                    ...(produtoId !== undefined && { produtoId }),
                    ...(funcionarioId !== undefined && { funcionarioId }),
                    ...(data !== undefined && { data }),
                    quantidade: qtdFabricacao,
                    status,
                }, { transaction: t });
            });

            const fabAtualizada = await Fabricacao.findByPk(fab.id, { include: [{ model: Produto, as: 'produto' }, { model: Funcionario, as: 'funcionario' }] });
            return sucesso(res, fabAtualizada, "Fabricação concluída: estoque de insumos debitado e produto incrementado.");
        }

        // Atualização normal (sem conclusão)
        await fab.update({
            ...(produtoId !== undefined && { produtoId }),
            ...(funcionarioId !== undefined && { funcionarioId }),
            ...(data !== undefined && { data }),
            ...(quantidade !== undefined && { quantidade: qtdFabricacao }),
            ...(status !== undefined && { status })
        });

        return sucesso(res, fab, "Ordem de fabricação atualizada com sucesso.");
    } catch (error) {
        if (error.estoqueInsuficiente) {
            return erroDeValidacao(res, { estoque: error.message });
        }
        return erroDoSequelize(res, error, "Erro ao atualizar ordem de fabricação.");
    }
};

export const destroy = async (req, res) => {
    try {
        const fab = await Fabricacao.findByPk(req.params.id);
        if (!fab) return erro(res, 404, "Ordem de fabricação não encontrada.");
        await fab.destroy();
        return sucesso(res, null, "Ordem de fabricação removida com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover ordem de fabricação.");
    }
};

export default { getAll, getById, create, update, destroy };

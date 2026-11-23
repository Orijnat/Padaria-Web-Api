import { OrdemFabricacao, Produto, Funcionario } from "../models/index.js";

/**
 * Controller para operações CRUD de Ordem de Fabricação
 */

const STATUS = ["planejado", "em_producao", "concluido"];

// O que vem junto em cada ordem: dados do produto e do funcionário responsável
const incluir = [
    { model: Produto, as: "produto", attributes: ["id", "nome"] },
    { model: Funcionario, as: "funcionario", attributes: ["id", "nome", "cargo"] }
];

// Aceita os nomes do front (produtoId, data) e os do banco (produto_id, data_producao)
function lerCorpo(body) {
    return {
        produtoId: body.produtoId ?? body.produto_id,
        funcionarioId: body.funcionarioId ?? body.funcionario_id,
        data_producao: body.data_producao ?? body.data,
        quantidade: body.quantidade,
        status: body.status
    };
}

export const getAll = async (req, res) => {
    try {
        const ordens = await OrdemFabricacao.findAll({
            include: incluir,
            order: [
                ['data_producao', 'DESC'],
                ['id', 'DESC']
            ]
        });
        return res.status(200).json(ordens);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar ordens de fabricação.",
            error: error.message
        });
    }
};

export const getId = async (req, res) => {
    try {
        const { id } = req.params;
        const ordem = await OrdemFabricacao.findByPk(id, { include: incluir });

        if (!ordem) {
            return res.status(404).json({ message: "Ordem de fabricação não encontrada." });
        }

        return res.status(200).json(ordem);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar ordem de fabricação por ID.",
            error: error.message
        });
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const { produtoId, funcionarioId, data_producao, quantidade, status } = lerCorpo(req.body);

        if (!produtoId) {
            return res.status(400).json({ message: "O campo 'produtoId' é obrigatório." });
        }

        if (!funcionarioId) {
            return res.status(400).json({ message: "O campo 'funcionarioId' é obrigatório." });
        }

        if (!data_producao) {
            return res.status(400).json({ message: "O campo 'data' (data de produção) é obrigatório." });
        }

        if (!quantidade || isNaN(Number(quantidade)) || Number(quantidade) <= 0) {
            return res.status(400).json({ message: "O campo 'quantidade' deve ser um número maior que zero." });
        }

        if (status !== undefined && !STATUS.includes(status)) {
            return res.status(400).json({ message: "Status inválido. Use: planejado, em_producao ou concluido." });
        }

        if (!(await Produto.findByPk(produtoId))) {
            return res.status(400).json({ message: "Produto não encontrado." });
        }

        if (!(await Funcionario.findByPk(funcionarioId))) {
            return res.status(400).json({ message: "Funcionário não encontrado." });
        }

        const nova = await OrdemFabricacao.create({
            produtoId: Number(produtoId),
            funcionarioId: Number(funcionarioId),
            data_producao,
            quantidade: Number(quantidade),
            status: status ?? "planejado"
        });

        const completa = await OrdemFabricacao.findByPk(nova.id, { include: incluir });
        return res.status(201).json(completa);
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação ao criar ordem de fabricação.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao criar ordem de fabricação.",
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const ordem = await OrdemFabricacao.findByPk(id);

        if (!ordem) {
            return res.status(404).json({ message: "Ordem de fabricação não encontrada." });
        }

        const { produtoId, funcionarioId, data_producao, quantidade, status } = lerCorpo(req.body);

        if (quantidade !== undefined && (isNaN(Number(quantidade)) || Number(quantidade) <= 0)) {
            return res.status(400).json({ message: "O campo 'quantidade' deve ser um número maior que zero." });
        }

        if (status !== undefined && !STATUS.includes(status)) {
            return res.status(400).json({ message: "Status inválido. Use: planejado, em_producao ou concluido." });
        }

        if (produtoId !== undefined && !(await Produto.findByPk(produtoId))) {
            return res.status(400).json({ message: "Produto não encontrado." });
        }

        if (funcionarioId !== undefined && !(await Funcionario.findByPk(funcionarioId))) {
            return res.status(400).json({ message: "Funcionário não encontrado." });
        }

        await ordem.update({
            ...(produtoId !== undefined && { produtoId: Number(produtoId) }),
            ...(funcionarioId !== undefined && { funcionarioId: Number(funcionarioId) }),
            ...(data_producao !== undefined && { data_producao }),
            ...(quantidade !== undefined && { quantidade: Number(quantidade) }),
            ...(status !== undefined && { status })
        });

        const completa = await OrdemFabricacao.findByPk(ordem.id, { include: incluir });
        return res.status(200).json(completa);
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação ao atualizar ordem de fabricação.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao atualizar ordem de fabricação.",
            error: error.message
        });
    }
};

// Botões "Iniciar" e "Concluir" da lista
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const ordem = await OrdemFabricacao.findByPk(id);

        if (!ordem) {
            return res.status(404).json({ message: "Ordem de fabricação não encontrada." });
        }

        if (!STATUS.includes(status)) {
            return res.status(400).json({ message: "Status inválido. Use: planejado, em_producao ou concluido." });
        }

        await ordem.update({ status });

        const completa = await OrdemFabricacao.findByPk(ordem.id, { include: incluir });
        return res.status(200).json(completa);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao atualizar o status da ordem de fabricação.",
            error: error.message
        });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const ordem = await OrdemFabricacao.findByPk(id);

        if (!ordem) {
            return res.status(404).json({ message: "Ordem de fabricação não encontrada." });
        }

        await ordem.destroy();

        return res.status(200).json({ message: "Ordem de fabricação removida com sucesso." });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover ordem de fabricação.",
            error: error.message
        });
    }
};

export default {
    getAll,
    getId,
    getById,
    create,
    update,
    updateStatus,
    destroy
};

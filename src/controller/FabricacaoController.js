import { Fabricacao, Produto, Funcionario } from "../models/index.js";
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

export const update = async (req, res) => {
    try {
        const fab = await Fabricacao.findByPk(req.params.id);
        if (!fab) return erro(res, 404, "Ordem de fabricação não encontrada.");

        const { produtoId, funcionarioId, data, quantidade, status } = req.body;

        if (produtoId !== undefined) {
            const produto = await Produto.findByPk(produtoId);
            if (!produto) return erro(res, 404, `Produto com id ${produtoId} não encontrado.`);
        }
        if (funcionarioId) {
            const funcionario = await Funcionario.findByPk(funcionarioId);
            if (!funcionario) return erro(res, 404, `Funcionário com id ${funcionarioId} não encontrado.`);
        }

        await fab.update({
            ...(produtoId !== undefined && { produtoId }),
            ...(funcionarioId !== undefined && { funcionarioId }),
            ...(data !== undefined && { data }),
            ...(quantidade !== undefined && { quantidade: Number(quantidade) }),
            ...(status !== undefined && { status })
        });

        return sucesso(res, fab, "Ordem de fabricação atualizada com sucesso.");
    } catch (error) {
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

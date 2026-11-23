import { Insumo } from "../models/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";

export const getAll = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({ order: [['id', 'ASC']] });
        return sucesso(res, insumos);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar insumos.", error.message);
    }
};

export const getId = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id);
        if (!insumo) return erro(res, 404, "Insumo não encontrado.");
        return sucesso(res, insumo);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar insumo.", error.message);
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const { nome, unidadeMedida, quantidadeAtual, estoqueMinimo, custo, fornecedor } = req.body;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return erroDeValidacao(res, { nome: "O campo 'nome' é obrigatório." });
        }
        if (!unidadeMedida || typeof unidadeMedida !== "string" || !unidadeMedida.trim()) {
            return erroDeValidacao(res, { unidadeMedida: "O campo 'unidadeMedida' é obrigatório." });
        }

        const novoInsumo = await Insumo.create({
            nome: nome.trim(),
            unidadeMedida: unidadeMedida.trim(),
            quantidadeAtual: quantidadeAtual !== undefined ? Number(quantidadeAtual) : 0,
            estoqueMinimo: estoqueMinimo !== undefined ? Number(estoqueMinimo) : 0,
            custo: custo !== undefined && custo !== null ? Number(custo) : 0,
            fornecedor: fornecedor ? String(fornecedor).trim() : null
        });

        return criado(res, novoInsumo, "Insumo criado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao criar insumo.");
    }
};

export const update = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id);
        if (!insumo) return erro(res, 404, "Insumo não encontrado.");

        const { nome, unidadeMedida, quantidadeAtual, estoqueMinimo, custo, fornecedor } = req.body;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return erroDeValidacao(res, { nome: "O campo 'nome' não pode ser vazio." });
        }
        if (unidadeMedida !== undefined && (typeof unidadeMedida !== "string" || !unidadeMedida.trim())) {
            return erroDeValidacao(res, { unidadeMedida: "O campo 'unidadeMedida' não pode ser vazio." });
        }

        await insumo.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(unidadeMedida !== undefined && { unidadeMedida: unidadeMedida.trim() }),
            ...(quantidadeAtual !== undefined && { quantidadeAtual: Number(quantidadeAtual) }),
            ...(estoqueMinimo !== undefined && { estoqueMinimo: Number(estoqueMinimo) }),
            ...(custo !== undefined && { custo: Number(custo) }),
            ...(fornecedor !== undefined && { fornecedor: fornecedor ? String(fornecedor).trim() : null })
        });

        return sucesso(res, insumo, "Insumo atualizado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar insumo.");
    }
};

export const destroy = async (req, res) => {
    try {
        const insumo = await Insumo.findByPk(req.params.id);
        if (!insumo) return erro(res, 404, "Insumo não encontrado.");
        await insumo.destroy();
        return sucesso(res, null, "Insumo removido com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover insumo.");
    }
};

export default {
    getAll,
    getId,
    getById,
    create,
    update,
    destroy
};

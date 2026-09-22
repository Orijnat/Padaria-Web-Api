import { Insumo } from "../models/index.js";

/**
 * Controller para operações CRUD de Insumo
 */

export const getAll = async (req, res) => {
    try {
        const insumos = await Insumo.findAll();
        return res.status(200).json(insumos);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar insumos.",
            error: error.message
        });
    }
};

export const getId = async (req, res) => {
    try {
        const { id } = req.params;
        const insumo = await Insumo.findByPk(id);

        if (!insumo) {
            return res.status(404).json({ message: "Insumo não encontrado." });
        }

        return res.status(200).json(insumo);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar insumo por ID.",
            error: error.message
        });
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const {
            nome,
            unidade_medida,
            unidadeMedida,
            quantidade_atual,
            quantidadeAtual,
            estoque_minimo,
            estoqueMinimo
        } = req.body;

        const unidade = unidade_medida ?? unidadeMedida;
        const qtdAtual = quantidade_atual ?? quantidadeAtual ?? 0;
        const estMinimo = estoque_minimo ?? estoqueMinimo ?? 0;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
        }

        if (!unidade || typeof unidade !== "string" || !unidade.trim()) {
            return res.status(400).json({ message: "O campo 'unidade_medida' é obrigatório." });
        }

        const novoInsumo = await Insumo.create({
            nome: nome.trim(),
            unidade_medida: unidade.trim(),
            quantidade_atual: qtdAtual,
            estoque_minimo: estMinimo
        });

        return res.status(201).json(novoInsumo);
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao criar insumo.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao criar insumo.",
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const insumo = await Insumo.findByPk(id);

        if (!insumo) {
            return res.status(404).json({ message: "Insumo não encontrado." });
        }

        const {
            nome,
            unidade_medida,
            unidadeMedida,
            quantidade_atual,
            quantidadeAtual,
            estoque_minimo,
            estoqueMinimo
        } = req.body;

        const unidade = unidade_medida ?? unidadeMedida;
        const qtdAtual = quantidade_atual ?? quantidadeAtual;
        const estMinimo = estoque_minimo ?? estoqueMinimo;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return res.status(400).json({ message: "O campo 'nome' não pode ser vazio." });
        }

        if (unidade !== undefined && (typeof unidade !== "string" || !unidade.trim())) {
            return res.status(400).json({ message: "O campo 'unidade_medida' não pode ser vazio." });
        }

        await insumo.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(unidade !== undefined && { unidade_medida: unidade.trim() }),
            ...(qtdAtual !== undefined && { quantidade_atual: qtdAtual }),
            ...(estMinimo !== undefined && { estoque_minimo: estMinimo })
        });

        return res.status(200).json(insumo);
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao atualizar insumo.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao atualizar insumo.",
            error: error.message
        });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const insumo = await Insumo.findByPk(id);

        if (!insumo) {
            return res.status(404).json({ message: "Insumo não encontrado." });
        }

        await insumo.destroy();

        return res.status(200).json({ message: "Insumo removido com sucesso." });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover insumo.",
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
    destroy
};

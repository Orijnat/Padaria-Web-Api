import { Insumo } from "../models/index.js";

/**
 * Controller para operações CRUD de Insumo
 */

export const getAll = async (req, res) => {
    try {
        const insumos = await Insumo.findAll({ order: [['id', 'ASC']] });
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
            unidade,
            quantidade_atual,
            quantidadeAtual,
            estoque,
            estoque_minimo,
            estoqueMinimo,
            minimo,
            custo,
            fornecedor
        } = req.body;

        const unidadeFinal = unidade_medida ?? unidadeMedida ?? unidade;
        const qtdFinal = quantidade_atual ?? quantidadeAtual ?? estoque ?? 0;
        const minimoFinal = estoque_minimo ?? estoqueMinimo ?? minimo ?? 0;
        const custoFinal = custo !== undefined && custo !== null ? Number(custo) : 0;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
        }

        if (!unidadeFinal || typeof unidadeFinal !== "string" || !unidadeFinal.trim()) {
            return res.status(400).json({ message: "O campo 'unidade_medida' é obrigatório." });
        }

        const novoInsumo = await Insumo.create({
            nome: nome.trim(),
            unidade_medida: unidadeFinal.trim(),
            quantidade_atual: Number(qtdFinal),
            estoque_minimo: Number(minimoFinal),
            custo: custoFinal,
            fornecedor: fornecedor ? String(fornecedor).trim() : null
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
            unidade,
            quantidade_atual,
            quantidadeAtual,
            estoque,
            estoque_minimo,
            estoqueMinimo,
            minimo,
            custo,
            fornecedor
        } = req.body;

        const unidadeFinal = unidade_medida ?? unidadeMedida ?? unidade;
        const qtdFinal = quantidade_atual ?? quantidadeAtual ?? estoque;
        const minimoFinal = estoque_minimo ?? estoqueMinimo ?? minimo;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return res.status(400).json({ message: "O campo 'nome' não pode ser vazio." });
        }

        if (unidadeFinal !== undefined && (typeof unidadeFinal !== "string" || !unidadeFinal.trim())) {
            return res.status(400).json({ message: "O campo 'unidade_medida' não pode ser vazio." });
        }

        await insumo.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(unidadeFinal !== undefined && { unidade_medida: unidadeFinal.trim() }),
            ...(qtdFinal !== undefined && { quantidade_atual: Number(qtdFinal) }),
            ...(minimoFinal !== undefined && { estoque_minimo: Number(minimoFinal) }),
            ...(custo !== undefined && { custo: Number(custo) }),
            ...(fornecedor !== undefined && { fornecedor: fornecedor ? String(fornecedor).trim() : null })
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

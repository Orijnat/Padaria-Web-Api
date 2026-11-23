import { Receita, Produto, Insumo } from "../models/index.js";

/**
 * Controller para operações CRUD de Receita
 */

export const getAll = async (req, res) => {
    try {
        const receitas = await Receita.findAll({
            include: [
                { model: Produto, as: "produto" },
                { model: Insumo, as: "insumo" }
            ]
        });
        return res.status(200).json(receitas);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar receitas.",
            error: error.message
        });
    }
};

export const getId = async (req, res) => {
    try {
        const { id } = req.params;
        const receita = await Receita.findByPk(id, {
            include: [
                { model: Produto, as: "produto" },
                { model: Insumo, as: "insumo" }
            ]
        });

        if (!receita) {
            return res.status(404).json({ message: "Receita não encontrada." });
        }

        return res.status(200).json(receita);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar receita por ID.",
            error: error.message
        });
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const {
            quantidade_necessaria,
            quantidadeNecessaria,
            idProduto,
            produto_id,
            idInsumo,
            insumo_id
        } = req.body;

        const qtd = quantidade_necessaria ?? quantidadeNecessaria;
        const prodId = idProduto ?? produto_id;
        const insId = idInsumo ?? insumo_id;

        if (qtd === undefined || qtd === null || isNaN(Number(qtd)) || Number(qtd) <= 0) {
            return res.status(400).json({
                message: "O campo 'quantidade_necessaria' é obrigatório e deve ser um número maior que zero."
            });
        }

        if (!prodId || isNaN(Number(prodId))) {
            return res.status(400).json({
                message: "O campo 'produto_id' (ou 'idProduto') é obrigatório."
            });
        }

        if (!insId || isNaN(Number(insId))) {
            return res.status(400).json({
                message: "O campo 'insumo_id' (ou 'idInsumo') é obrigatório."
            });
        }

        // Verifica existência de Produto e Insumo
        const [produtoExiste, insumoExiste] = await Promise.all([
            Produto.findByPk(prodId),
            Insumo.findByPk(insId)
        ]);

        if (!produtoExiste) {
            return res.status(404).json({ message: `Produto com id ${prodId} não encontrado.` });
        }

        if (!insumoExiste) {
            return res.status(404).json({ message: `Insumo com id ${insId} não encontrado.` });
        }

        const novaReceita = await Receita.create({
            quantidade_necessaria: Number(qtd),
            idProduto: Number(prodId),
            idInsumo: Number(insId)
        });

        // Recarrega incluindo associações para resposta completa
        const receitaCriada = await Receita.findByPk(novaReceita.id, {
            include: [
                { model: Produto, as: "produto" },
                { model: Insumo, as: "insumo" }
            ]
        });

        return res.status(201).json(receitaCriada || novaReceita);
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({
                message: "Erro de chave estrangeira: verifique se produto e insumo informados existem.",
                error: error.message
            });
        }

        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao criar receita.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao criar receita.",
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const receita = await Receita.findByPk(id);

        if (!receita) {
            return res.status(404).json({ message: "Receita não encontrada." });
        }

        const {
            quantidade_necessaria,
            quantidadeNecessaria,
            idProduto,
            produto_id,
            idInsumo,
            insumo_id
        } = req.body;

        const qtd = quantidade_necessaria ?? quantidadeNecessaria;
        const prodId = idProduto ?? produto_id;
        const insId = idInsumo ?? insumo_id;

        if (qtd !== undefined && (isNaN(Number(qtd)) || Number(qtd) <= 0)) {
            return res.status(400).json({
                message: "O campo 'quantidade_necessaria' deve ser um número maior que zero."
            });
        }

        if (prodId !== undefined) {
            const produtoExiste = await Produto.findByPk(prodId);
            if (!produtoExiste) {
                return res.status(404).json({ message: `Produto com id ${prodId} não encontrado.` });
            }
        }

        if (insId !== undefined) {
            const insumoExiste = await Insumo.findByPk(insId);
            if (!insumoExiste) {
                return res.status(404).json({ message: `Insumo com id ${insId} não encontrado.` });
            }
        }

        await receita.update({
            ...(qtd !== undefined && { quantidade_necessaria: Number(qtd) }),
            ...(prodId !== undefined && { idProduto: Number(prodId) }),
            ...(insId !== undefined && { idInsumo: Number(insId) })
        });

        // Recarrega incluindo associações para retorno completo
        const receitaAtualizada = await Receita.findByPk(id, {
            include: [
                { model: Produto, as: "produto" },
                { model: Insumo, as: "insumo" }
            ]
        });

        return res.status(200).json(receitaAtualizada || receita);
    } catch (error) {
        if (error.name === "SequelizeForeignKeyConstraintError") {
            return res.status(400).json({
                message: "Erro de chave estrangeira ao atualizar receita.",
                error: error.message
            });
        }

        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao atualizar receita.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao atualizar receita.",
            error: error.message
        });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const receita = await Receita.findByPk(id);

        if (!receita) {
            return res.status(404).json({ message: "Receita não encontrada." });
        }

        await receita.destroy();

        return res.status(200).json({ message: "Receita removida com sucesso." });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover receita.",
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

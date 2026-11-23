import { Produto } from "../models/index.js";

/**
 * Controller para operações CRUD de Produto
 */

export const getAll = async (req, res) => {
    try {
        const produtos = await Produto.findAll({ order: [['id', 'ASC']] });
        return res.status(200).json(produtos);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar produtos.",
            error: error.message
        });
    }
};

export const getId = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        return res.status(200).json(produto);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar produto por ID.",
            error: error.message
        });
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const {
            nome,
            preco,
            estoque,
            categoria_id,
            categoriaId,
            receita_id,
            receitaId,
            descricao,
            emoji,
            ativo
        } = req.body;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
        }

        if (preco === undefined || preco === null || isNaN(Number(preco))) {
            return res.status(400).json({ message: "O campo 'preco' é obrigatório e deve ser numérico." });
        }

        const novoProduto = await Produto.create({
            nome: nome.trim(),
            preco: Number(preco),
            estoque: estoque !== undefined && estoque !== null ? Number(estoque) : 0,
            categoria_id: categoria_id ?? categoriaId ?? null,
            receita_id: receita_id ?? receitaId ?? null,
            descricao: descricao ? String(descricao).trim() : null,
            emoji: emoji ? String(emoji).trim() : '🥖',
            ativo: ativo !== undefined ? Boolean(ativo) : true
        });

        return res.status(201).json(novoProduto);
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao criar produto.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao criar produto.",
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        const {
            nome,
            preco,
            estoque,
            categoria_id,
            categoriaId,
            receita_id,
            receitaId,
            descricao,
            emoji,
            ativo
        } = req.body;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return res.status(400).json({ message: "O campo 'nome' não pode ser vazio." });
        }

        if (preco !== undefined && isNaN(Number(preco))) {
            return res.status(400).json({ message: "O campo 'preco' deve ser numérico." });
        }

        await produto.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(preco !== undefined && { preco: Number(preco) }),
            ...(estoque !== undefined && { estoque: Number(estoque) }),
            ...(categoria_id !== undefined || categoriaId !== undefined ? { categoria_id: categoria_id ?? categoriaId } : {}),
            ...(receita_id !== undefined || receitaId !== undefined ? { receita_id: receita_id ?? receitaId } : {}),
            ...(descricao !== undefined && { descricao: descricao ? String(descricao).trim() : null }),
            ...(emoji !== undefined && { emoji: emoji ? String(emoji).trim() : '🥖' }),
            ...(ativo !== undefined && { ativo: Boolean(ativo) })
        });

        return res.status(200).json(produto);
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao atualizar produto.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao atualizar produto.",
            error: error.message
        });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await Produto.findByPk(id);

        if (!produto) {
            return res.status(404).json({ message: "Produto não encontrado." });
        }

        await produto.destroy();

        return res.status(200).json({ message: "Produto removido com sucesso." });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover produto.",
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

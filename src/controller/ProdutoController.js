import { Produto } from "../models/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";
import { paraBooleano } from "../utils/validacao.js";

export const getAll = async (req, res) => {
    try {
        const produtos = await Produto.findAll({ order: [['id', 'ASC']] });
        return sucesso(res, produtos);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar produtos.", error.message);
    }
};

export const getId = async (req, res) => {
    try {
        const produto = await Produto.findByPk(req.params.id);
        if (!produto) return erro(res, 404, "Produto não encontrado.");
        return sucesso(res, produto);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar produto.", error.message);
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const { nome, preco, estoque, categoriaId, receitaId, descricao, emoji, ativo } = req.body;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return erroDeValidacao(res, { nome: "O campo 'nome' é obrigatório." });
        }
        if (preco === undefined || preco === null || isNaN(Number(preco))) {
            return erroDeValidacao(res, { preco: "O campo 'preco' é obrigatório e deve ser numérico." });
        }

        const novoProduto = await Produto.create({
            nome: nome.trim(),
            preco: Number(preco),
            estoque: estoque !== undefined && estoque !== null ? Number(estoque) : 0,
            categoriaId: categoriaId !== undefined ? categoriaId : null,
            receitaId: receitaId !== undefined ? receitaId : null,
            descricao: descricao ? String(descricao).trim() : null,
            emoji: emoji ? String(emoji).trim() : '🥖',
            ativo: paraBooleano(ativo, true)
        });

        return criado(res, novoProduto, "Produto criado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao criar produto.");
    }
};

export const update = async (req, res) => {
    try {
        const produto = await Produto.findByPk(req.params.id);
        if (!produto) return erro(res, 404, "Produto não encontrado.");

        const { nome, preco, estoque, categoriaId, receitaId, descricao, emoji, ativo } = req.body;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return erroDeValidacao(res, { nome: "O campo 'nome' não pode ser vazio." });
        }
        if (preco !== undefined && isNaN(Number(preco))) {
            return erroDeValidacao(res, { preco: "O campo 'preco' deve ser numérico." });
        }

        await produto.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(preco !== undefined && { preco: Number(preco) }),
            ...(estoque !== undefined && { estoque: Number(estoque) }),
            ...(categoriaId !== undefined && { categoriaId }),
            ...(receitaId !== undefined && { receitaId }),
            ...(descricao !== undefined && { descricao: descricao ? String(descricao).trim() : null }),
            ...(emoji !== undefined && { emoji: emoji ? String(emoji).trim() : '🥖' }),
            ...(ativo !== undefined && { ativo: paraBooleano(ativo, true) })
        });

        return sucesso(res, produto, "Produto atualizado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar produto.");
    }
};

export const destroy = async (req, res) => {
    try {
        const produto = await Produto.findByPk(req.params.id);
        if (!produto) return erro(res, 404, "Produto não encontrado.");
        await produto.destroy();
        return sucesso(res, null, "Produto removido com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover produto.");
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

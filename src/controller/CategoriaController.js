import { Categoria } from "../models/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";
import { paraBooleano } from "../utils/validacao.js";

export const getAll = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({ order: [['id', 'ASC']] });
        return sucesso(res, categorias);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar categorias.", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return erro(res, 404, "Categoria não encontrada.");
        return sucesso(res, categoria);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar categoria.", error.message);
    }
};

export const create = async (req, res) => {
    try {
        const { nome, descricao, emoji, cor, ativo } = req.body;
        if (!nome || typeof nome !== 'string' || !nome.trim()) {
            return erroDeValidacao(res, { nome: "O campo 'nome' é obrigatório." });
        }
        const nova = await Categoria.create({
            nome: nome.trim(),
            descricao,
            emoji: emoji || '',
            cor: cor || '#c48d4a',
            ativo: paraBooleano(ativo, true)
        });
        return criado(res, nova, "Categoria criada com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao criar categoria.");
    }
};

export const update = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return erro(res, 404, "Categoria não encontrada.");

        const { nome, descricao, emoji, cor, ativo } = req.body;
        if (nome !== undefined && (typeof nome !== 'string' || !nome.trim())) {
            return erroDeValidacao(res, { nome: "O campo 'nome' não pode ser vazio." });
        }

        await categoria.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(descricao !== undefined && { descricao }),
            ...(emoji !== undefined && { emoji }),
            ...(cor !== undefined && { cor }),
            ...(ativo !== undefined && { ativo: paraBooleano(ativo, true) })
        });

        return sucesso(res, categoria, "Categoria atualizada com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar categoria.");
    }
};

export const destroy = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return erro(res, 404, "Categoria não encontrada.");
        await categoria.destroy();
        return sucesso(res, null, "Categoria removida com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover categoria.");
    }
};

export default { getAll, getById, create, update, destroy };

import { Receita, ReceitaIngrediente, Insumo, Categoria } from "../models/index.js";
import { sequelize } from "../config/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";

const includeCompleto = [
    { model: Categoria, as: "categoria" },
    {
        model: ReceitaIngrediente,
        as: "ingredientes",
        include: [{ model: Insumo, as: "insumo" }]
    }
];

const carregarReceita = (id) => Receita.findByPk(id, { include: includeCompleto });

export const getAll = async (req, res) => {
    try {
        const receitas = await Receita.findAll({ include: includeCompleto, order: [['id', 'ASC']] });
        return sucesso(res, receitas);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar receitas.", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const receita = await carregarReceita(req.params.id);
        if (!receita) return erro(res, 404, "Receita não encontrada.");
        return sucesso(res, receita);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar receita.", error.message);
    }
};

export const getId = getById;

const validarIngredientes = async (ingredientes) => {
    if (!Array.isArray(ingredientes)) {
        return { erro: { ingredientes: "O campo 'ingredientes' deve ser um array de { insumoId, quantidade }." } };
    }
    const campos = {};
    for (const [i, item] of ingredientes.entries()) {
        const insumoId = Number(item?.insumoId);
        const quantidade = Number(item?.quantidade);
        if (!Number.isInteger(insumoId) || insumoId <= 0) campos[`ingredientes[${i}].insumoId`] = "insumoId inválido.";
        if (!(quantidade > 0)) campos[`ingredientes[${i}].quantidade`] = "quantidade deve ser maior que zero.";
    }
    if (Object.keys(campos).length > 0) return { erro: campos };

    const ids = [...new Set(ingredientes.map((item) => Number(item.insumoId)))];
    if (ids.length !== ingredientes.length) {
        return { erro: { ingredientes: "Ingrediente duplicado na ficha técnica." } };
    }
    if (ids.length > 0) {
        const encontrados = await Insumo.count({ where: { id: ids } });
        if (encontrados !== ids.length) {
            return { erro: { ingredientes: "Um ou mais insumos informados não existem." } };
        }
    }
    return { ok: true, itens: ingredientes.map((item) => ({ insumoId: Number(item.insumoId), quantidade: Number(item.quantidade) })) };
};

export const create = async (req, res) => {
    try {
        const { nome, categoriaId, rendimento, unidadeRendimento, tempoPreparo, instrucoes, ingredientes } = req.body;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return erroDeValidacao(res, { nome: "O campo 'nome' é obrigatório." });
        }

        let itensValidados = [];
        if (ingredientes !== undefined) {
            const resultado = await validarIngredientes(ingredientes);
            if (resultado.erro) return erroDeValidacao(res, resultado.erro);
            itensValidados = resultado.itens;
        }

        const novaReceita = await sequelize.transaction(async (t) => {
            const criada = await Receita.create({
                nome: nome.trim(),
                categoriaId: categoriaId !== undefined ? categoriaId : null,
                rendimento: rendimento !== undefined ? Number(rendimento) : 1,
                unidadeRendimento: unidadeRendimento ? String(unidadeRendimento).trim() : 'unidades',
                tempoPreparo: tempoPreparo !== undefined ? Number(tempoPreparo) : 0,
                instrucoes: instrucoes || null
            }, { transaction: t });

            if (itensValidados.length > 0) {
                await ReceitaIngrediente.bulkCreate(
                    itensValidados.map((item) => ({ ...item, receitaId: criada.id })),
                    { transaction: t }
                );
            }
            return criada;
        });

        const completa = await carregarReceita(novaReceita.id);
        return criado(res, completa, "Receita criada com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao criar receita.");
    }
};

export const update = async (req, res) => {
    try {
        const receita = await Receita.findByPk(req.params.id);
        if (!receita) return erro(res, 404, "Receita não encontrada.");

        const { nome, categoriaId, rendimento, unidadeRendimento, tempoPreparo, instrucoes, ingredientes } = req.body;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return erroDeValidacao(res, { nome: "O campo 'nome' não pode ser vazio." });
        }

        let itensValidados;
        if (ingredientes !== undefined) {
            const resultado = await validarIngredientes(ingredientes);
            if (resultado.erro) return erroDeValidacao(res, resultado.erro);
            itensValidados = resultado.itens;
        }

        await sequelize.transaction(async (t) => {
            await receita.update({
                ...(nome !== undefined && { nome: nome.trim() }),
                ...(categoriaId !== undefined && { categoriaId }),
                ...(rendimento !== undefined && { rendimento: Number(rendimento) }),
                ...(unidadeRendimento !== undefined && { unidadeRendimento: String(unidadeRendimento).trim() }),
                ...(tempoPreparo !== undefined && { tempoPreparo: Number(tempoPreparo) }),
                ...(instrucoes !== undefined && { instrucoes })
            }, { transaction: t });

            if (itensValidados !== undefined) {
                await ReceitaIngrediente.destroy({ where: { receitaId: receita.id }, transaction: t });
                if (itensValidados.length > 0) {
                    await ReceitaIngrediente.bulkCreate(
                        itensValidados.map((item) => ({ ...item, receitaId: receita.id })),
                        { transaction: t }
                    );
                }
            }
        });

        const atualizada = await carregarReceita(receita.id);
        return sucesso(res, atualizada, "Receita atualizada com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar receita.");
    }
};

export const destroy = async (req, res) => {
    try {
        const receita = await Receita.findByPk(req.params.id);
        if (!receita) return erro(res, 404, "Receita não encontrada.");
        await receita.destroy();
        return sucesso(res, null, "Receita removida com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover receita.");
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

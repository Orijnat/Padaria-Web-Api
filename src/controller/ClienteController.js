import { Cliente } from "../models/index.js";

/**
 * Controller para operações CRUD de Cliente
 */

export const getAll = async (req, res) => {
    try {
        const clientes = await Cliente.findAll();
        return res.status(200).json(clientes);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar clientes.",
            error: error.message
        });
    }
};

export const getId = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }

        return res.status(200).json(cliente);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar cliente por ID.",
            error: error.message
        });
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const { nome, telefone, email, endereco } = req.body;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
        }

        const novoCliente = await Cliente.create({
            nome: nome.trim(),
            telefone,
            email,
            endereco
        });

        return res.status(201).json(novoCliente);
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao criar cliente.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao criar cliente.",
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }

        const { nome, telefone, email, endereco } = req.body;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return res.status(400).json({ message: "O campo 'nome' não pode ser vazio." });
        }

        await cliente.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(telefone !== undefined && { telefone }),
            ...(email !== undefined && { email }),
            ...(endereco !== undefined && { endereco })
        });

        return res.status(200).json(cliente);
    } catch (error) {
        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({
                message: "Erro de validação ao atualizar cliente.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao atualizar cliente.",
            error: error.message
        });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findByPk(id);

        if (!cliente) {
            return res.status(404).json({ message: "Cliente não encontrado." });
        }

        await cliente.destroy();

        return res.status(200).json({ message: "Cliente removido com sucesso." });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover cliente.",
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

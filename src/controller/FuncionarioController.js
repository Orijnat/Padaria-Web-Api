import { Funcionario } from "../models/index.js";

/**
 * Controller para operações CRUD de Funcionário
 */

export const getAll = async (req, res) => {
    try {
        const funcionarios = await Funcionario.findAll({ order: [['nome', 'ASC']] });
        return res.status(200).json(funcionarios);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar funcionários.",
            error: error.message
        });
    }
};

export const getId = async (req, res) => {
    try {
        const { id } = req.params;
        const funcionario = await Funcionario.findByPk(id);

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado." });
        }

        return res.status(200).json(funcionario);
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao buscar funcionário por ID.",
            error: error.message
        });
    }
};

export const getById = getId;

export const create = async (req, res) => {
    try {
        const {
            nome,
            cpf,
            email,
            telefone,
            cargo,
            data_admissao,
            dataAdmissao,
            salario,
            ativo
        } = req.body;

        const dataFinal = data_admissao ?? dataAdmissao;

        if (!nome || typeof nome !== "string" || !nome.trim()) {
            return res.status(400).json({ message: "O campo 'nome' é obrigatório." });
        }

        if (!cpf || typeof cpf !== "string" || !cpf.trim()) {
            return res.status(400).json({ message: "O campo 'cpf' é obrigatório." });
        }

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({ message: "O campo 'email' é obrigatório." });
        }

        if (!cargo || typeof cargo !== "string" || !cargo.trim()) {
            return res.status(400).json({ message: "O campo 'cargo' é obrigatório." });
        }

        if (!dataFinal) {
            return res.status(400).json({ message: "O campo 'data_admissao' é obrigatório." });
        }

        if (salario !== undefined && salario !== null && isNaN(Number(salario))) {
            return res.status(400).json({ message: "O campo 'salario' deve ser numérico." });
        }

        const novoFuncionario = await Funcionario.create({
            nome: nome.trim(),
            cpf: cpf.trim(),
            email: email.trim().toLowerCase(),
            telefone: telefone ? String(telefone).trim() : null,
            cargo: cargo.trim(),
            data_admissao: dataFinal,
            salario: salario !== undefined && salario !== null ? Number(salario) : 0,
            ativo: ativo !== undefined ? Boolean(ativo) : true
        });

        return res.status(201).json(novoFuncionario);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ message: "CPF ou e-mail já cadastrado." });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação ao criar funcionário.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao criar funcionário.",
            error: error.message
        });
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const funcionario = await Funcionario.findByPk(id);

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado." });
        }

        const {
            nome,
            cpf,
            email,
            telefone,
            cargo,
            data_admissao,
            dataAdmissao,
            salario,
            ativo
        } = req.body;

        const dataFinal = data_admissao ?? dataAdmissao;

        if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
            return res.status(400).json({ message: "O campo 'nome' não pode ser vazio." });
        }

        if (cpf !== undefined && (typeof cpf !== "string" || !cpf.trim())) {
            return res.status(400).json({ message: "O campo 'cpf' não pode ser vazio." });
        }

        if (email !== undefined && (typeof email !== "string" || !email.trim())) {
            return res.status(400).json({ message: "O campo 'email' não pode ser vazio." });
        }

        if (cargo !== undefined && (typeof cargo !== "string" || !cargo.trim())) {
            return res.status(400).json({ message: "O campo 'cargo' não pode ser vazio." });
        }

        if (salario !== undefined && isNaN(Number(salario))) {
            return res.status(400).json({ message: "O campo 'salario' deve ser numérico." });
        }

        await funcionario.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(cpf !== undefined && { cpf: cpf.trim() }),
            ...(email !== undefined && { email: email.trim().toLowerCase() }),
            ...(telefone !== undefined && { telefone: telefone ? String(telefone).trim() : null }),
            ...(cargo !== undefined && { cargo: cargo.trim() }),
            ...(dataFinal !== undefined && { data_admissao: dataFinal }),
            ...(salario !== undefined && { salario: Number(salario) }),
            ...(ativo !== undefined && { ativo: Boolean(ativo) })
        });

        return res.status(200).json(funcionario);
    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({ message: "CPF ou e-mail já cadastrado." });
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                message: "Erro de validação ao atualizar funcionário.",
                errors: error.errors?.map((err) => err.message) || error.message
            });
        }

        return res.status(500).json({
            message: "Erro ao atualizar funcionário.",
            error: error.message
        });
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const funcionario = await Funcionario.findByPk(id);

        if (!funcionario) {
            return res.status(404).json({ message: "Funcionário não encontrado." });
        }

        await funcionario.destroy();

        return res.status(200).json({ message: "Funcionário removido com sucesso." });
    } catch (error) {
        return res.status(500).json({
            message: "Erro ao remover funcionário.",
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

import { Funcionario } from "../models/index.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize } from "../utils/resposta.js";
import { paraBooleano } from "../utils/validacao.js";

export const getAll = async (req, res) => {
    try {
        const funcionarios = await Funcionario.findAll({ order: [['id', 'ASC']] });
        return sucesso(res, funcionarios);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar funcionários.", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const funcionario = await Funcionario.findByPk(req.params.id);
        if (!funcionario) return erro(res, 404, "Funcionário não encontrado.");
        return sucesso(res, funcionario);
    } catch (error) {
        return erro(res, 500, "Erro ao buscar funcionário.", error.message);
    }
};

export const create = async (req, res) => {
    try {
        const { nome, cargo, email, telefone, cpf, dataAdmissao, salario, ativo } = req.body;
        if (!nome || !cargo) {
            return erroDeValidacao(res, {
                ...((!nome) && { nome: "O campo 'nome' é obrigatório." }),
                ...((!cargo) && { cargo: "O campo 'cargo' é obrigatório." })
            });
        }
        const novo = await Funcionario.create({
            nome: nome.trim(),
            cargo: String(cargo).trim(),
            email,
            telefone,
            cpf,
            dataAdmissao: dataAdmissao || null,
            salario: salario !== undefined ? Number(salario) : 0,
            ativo: paraBooleano(ativo, true)
        });
        return criado(res, novo, "Funcionário criado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao criar funcionário.");
    }
};

export const update = async (req, res) => {
    try {
        const funcionario = await Funcionario.findByPk(req.params.id);
        if (!funcionario) return erro(res, 404, "Funcionário não encontrado.");

        const { nome, cargo, email, telefone, cpf, dataAdmissao, salario, ativo } = req.body;
        await funcionario.update({
            ...(nome !== undefined && { nome: nome.trim() }),
            ...(cargo !== undefined && { cargo: String(cargo).trim() }),
            ...(email !== undefined && { email }),
            ...(telefone !== undefined && { telefone }),
            ...(cpf !== undefined && { cpf }),
            ...(dataAdmissao !== undefined && { dataAdmissao }),
            ...(salario !== undefined && { salario: Number(salario) }),
            ...(ativo !== undefined && { ativo: paraBooleano(ativo, true) })
        });

        return sucesso(res, funcionario, "Funcionário atualizado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar funcionário.");
    }
};

export const destroy = async (req, res) => {
    try {
        const funcionario = await Funcionario.findByPk(req.params.id);
        if (!funcionario) return erro(res, 404, "Funcionário não encontrado.");
        await funcionario.destroy();
        return sucesso(res, null, "Funcionário removido com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover funcionário.");
    }
};

export default { getAll, getById, create, update, destroy };

import { Usuario, usuarioPublico } from "../models/index.js";
import { validarUsuario } from "../utils/validacao.js";
import { gerarHashSenha } from "../utils/senha.js";
import { gerarToken } from "../utils/token.js";
import { sucesso, criado, erro, erroDeValidacao, erroDoSequelize, conflito } from "../utils/resposta.js";

export const getAll = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({ order: [["id", "ASC"]] });
        return sucesso(res, usuarios.map(usuarioPublico));
    } catch (error) {
        return erro(res, 500, "Erro ao buscar usuários.", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const logado = req.usuario;
        if (!logado || (String(logado.id) !== String(id) && logado.tipo !== "funcionario")) {
            return erro(res, 403, "Você não tem permissão para acessar este usuário.");
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return erro(res, 404, "Usuário não encontrado.");
        }

        return sucesso(res, { usuario: usuarioPublico(usuario) });
    } catch (error) {
        return erro(res, 500, "Erro ao buscar usuário.", error.message);
    }
};

export const create = async (req, res) => {
    try {
        const { dados, erros } = validarUsuario(req.body);
        if (erros) {
            return erroDeValidacao(res, erros, "Verifique os campos obrigatórios.");
        }

        const logado = req.usuario;
        const porFuncionario = logado?.tipo === "funcionario";
        if (dados.tipo && dados.tipo !== "cliente" && !porFuncionario) {
            return erro(res, 403, "Somente funcionários podem cadastrar funcionários.");
        }

        const existente = await Usuario.findOne({ where: { email: dados.email } });
        if (existente) {
            return conflito(res, "E-mail já cadastrado.", { email: "Já existe um usuário com este e-mail." });
        }

        const { senha, ...resto } = dados;
        const senhaHash = await gerarHashSenha(senha);

        const novoUsuario = await Usuario.create({
            ...resto,
            telefone: resto.telefone ?? null,
            cpf: resto.cpf ?? null,
            tipo: resto.tipo ?? "cliente",
            senhaHash
        });

        const token = porFuncionario ? undefined : gerarToken(novoUsuario);

        return criado(res, { usuario: usuarioPublico(novoUsuario), token }, "Usuário cadastrado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao cadastrar usuário.");
    }
};

export const update = async (req, res) => {
    try {
        const { id } = req.params;
        const logado = req.usuario;

        if (!logado || (String(logado.id) !== String(id) && logado.tipo !== "funcionario")) {
            return erro(res, 403, "Você só pode alterar seu próprio cadastro.");
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return erro(res, 404, "Usuário não encontrado.");
        }

        const { dados, erros } = validarUsuario(req.body, { parcial: true });
        if (erros) {
            return erroDeValidacao(res, erros, "Erro na validação dos campos.");
        }

        if (dados.tipo && logado.tipo !== "funcionario") {
            return erro(res, 403, "Somente funcionários podem alterar o tipo de usuário.");
        }

        if (dados.email && dados.email !== usuario.email) {
            const outroComEmail = await Usuario.findOne({ where: { email: dados.email } });
            if (outroComEmail && outroComEmail.id !== usuario.id) {
                return conflito(res, "E-mail já cadastrado.", { email: "Já existe um usuário com este e-mail." });
            }
        }

        const { senha, ...alteracoes } = dados;
        if (senha) {
            alteracoes.senhaHash = await gerarHashSenha(senha);
        }
        alteracoes.atualizadoEm = new Date();

        await usuario.update(alteracoes);

        return sucesso(res, { usuario: usuarioPublico(usuario) }, "Usuário atualizado com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao atualizar usuário.");
    }
};

export const destroy = async (req, res) => {
    try {
        const { id } = req.params;
        const logado = req.usuario;

        if (!logado || (String(logado.id) !== String(id) && logado.tipo !== "funcionario")) {
            return erro(res, 403, "Você não tem permissão para excluir este usuário.");
        }

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return erro(res, 404, "Usuário não encontrado.");
        }

        await usuario.destroy();

        return sucesso(res, null, "Usuário removido com sucesso.");
    } catch (error) {
        return erroDoSequelize(res, error, "Erro ao remover usuário.");
    }
};

export default {
    getAll,
    getById,
    create,
    update,
    destroy
};

import { verificarToken } from "../utils/token.js";
import { Usuario, usuarioPublico } from "../models/index.js";
import { erro } from "../utils/resposta.js";

export const autenticarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (!authHeader) {
            return erro(res, 401, "Cabeçalho de autorização não fornecido.");
        }

        const [scheme, token] = authHeader.split(" ");
        if (scheme?.toLowerCase() !== "bearer" || !token) {
            return erro(res, 401, "Formato inválido. Utilize: Bearer <token>");
        }

        const payload = verificarToken(token);
        if (!payload) {
            return erro(res, 401, "Sessão expirada ou token inválido. Faça login novamente.");
        }

        try {
            const usuarioBanco = await Usuario.findByPk(payload.sub);
            if (!usuarioBanco) {
                return erro(res, 401, "Usuário não encontrado. Faça login novamente.");
            }
            req.usuario = usuarioBanco;
            req.usuarioPublico = usuarioPublico(usuarioBanco);
        } catch (dbError) {
            return erro(res, 500, "Erro ao consultar o usuário autenticado.");
        }

        next();
    } catch (error) {
        return erro(res, 500, "Erro interno na autenticação.", error.message);
    }
};

export const tokenOpcional = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader) return next();

    const [scheme, token] = authHeader.split(" ");
    if (scheme?.toLowerCase() === "bearer" && token) {
        const payload = verificarToken(token);
        if (payload) {
            try {
                const usuarioBanco = await Usuario.findByPk(payload.sub);
                if (usuarioBanco) req.usuario = usuarioBanco;
            } catch {
                // Sem o usuário no banco, segue anônimo (fail-closed).
            }
        }
    }
    next();
};

export const autorizarFuncionario = (req, res, next) => {
    if (!req.usuario || req.usuario.tipo !== "funcionario") {
        return erro(res, 403, "Acesso negado. Apenas funcionários podem realizar esta ação.");
    }
    next();
};

export default {
    autenticarToken,
    tokenOpcional,
    autorizarFuncionario
};

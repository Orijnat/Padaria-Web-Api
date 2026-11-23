import { Usuario, usuarioPublico } from "../models/index.js";
import { gerarHashSenha, verificarSenha, verificarSenhaFalsa } from "../utils/senha.js";
import { gerarToken } from "../utils/token.js";
import { sucesso, erro } from "../utils/resposta.js";

/**
 * Garante que exista pelo menos um usuário administrador/funcionário no sistema.
 */
async function garantirAdminInicial() {
    try {
        const count = await Usuario.count({ where: { tipo: "funcionario" } });
        if (count === 0) {
            const email = (process.env.ADMIN_EMAIL || "admin@padaria.com").toLowerCase();
            const senha = process.env.ADMIN_SENHA;
            if (process.env.NODE_ENV === "production" && !senha) return;

            const existe = await Usuario.findOne({ where: { email } });
            if (!existe) {
                await Usuario.create({
                    nome: "Administrador",
                    email,
                    tipo: "funcionario",
                    senhaHash: await gerarHashSenha(senha || "admin1234")
                });
                console.log("👤 Usuário administrador padrão criado:", email);
            }
        }
    } catch {
        // Se o banco ainda não estiver pronto ou tabela não criada, ignora
    }
}

/**
 * Controller de Autenticação
 */
export const login = async (req, res) => {
    try {
        const email = String(req.body?.email ?? "").trim().toLowerCase();
        const senha = typeof req.body?.senha === "string" ? req.body.senha : "";
        const tipoDesejado = req.body?.tipo;

        if (!email || !senha) {
            return erro(res, 400, "Campos 'email' e 'senha' são obrigatórios.");
        }

        await garantirAdminInicial();

        let usuario;
        try {
            usuario = await Usuario.findOne({ where: { email } });
        } catch (dbError) {
            return erro(res, 500, "Erro de comunicação com o banco de dados.", dbError.message);
        }

        const senhaConfere = usuario
            ? await verificarSenha(senha, usuario.senhaHash)
            : await verificarSenhaFalsa(senha);

        if (!senhaConfere) {
            return erro(res, 401, "E-mail ou senha incorretos.");
        }

        if (tipoDesejado === "funcionario" && usuario.tipo !== "funcionario") {
            return erro(res, 403, "Esta conta não tem acesso à área administrativa.");
        }

        const token = gerarToken(usuario);
        const dadosUsuario = usuarioPublico(usuario);

        return sucesso(res, { token, usuario: dadosUsuario });
    } catch (error) {
        return erro(res, 500, "Erro ao realizar login.", error.message);
    }
};

export const me = async (req, res) => {
    try {
        if (!req.usuario) {
            return erro(res, 401, "Nenhum usuário autenticado na sessão.");
        }

        return sucesso(res, { usuario: req.usuarioPublico || usuarioPublico(req.usuario) });
    } catch (error) {
        return erro(res, 500, "Erro ao obter dados do usuário autenticado.", error.message);
    }
};

export default {
    login,
    me
};

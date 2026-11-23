import { Router } from "express";
import {
    getAll,
    getById,
    create,
    update,
    destroy
} from "../controller/UsuarioController.js";
import { login } from "../controller/AuthController.js";
import {
    autenticarToken,
    autorizarFuncionario,
    tokenOpcional
} from "../middlewares/authMiddleware.js";

const router = Router();

// Login de usuário (rota de conveniência alternativa para /auth/login)
router.post("/login", login);

// Cadastro de usuário (aberto ao público com token opcional para verificar se é admin)
router.post("/", tokenOpcional, create);

// Listagem geral de usuários (somente funcionários)
router.get("/", autenticarToken, autorizarFuncionario, getAll);

// Operações por ID (o próprio usuário ou funcionário)
router.get("/:id", autenticarToken, getById);
router.put("/:id", autenticarToken, update);
router.patch("/:id", autenticarToken, update);
router.delete("/:id", autenticarToken, destroy);

export default router;

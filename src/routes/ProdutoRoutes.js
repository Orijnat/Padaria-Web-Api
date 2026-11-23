import { Router } from "express";
import {
    getAll,
    getById,
    create,
    update,
    destroy
} from "../controller/ProdutoController.js";
import { autenticarToken, autorizarFuncionario } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", autenticarToken, autorizarFuncionario, create);
router.put("/:id", autenticarToken, autorizarFuncionario, update);
router.delete("/:id", autenticarToken, autorizarFuncionario, destroy);

export default router;

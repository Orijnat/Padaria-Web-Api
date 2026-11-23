import { Router } from "express";
import { getAll, getById, create, update, destroy } from "../controller/PedidoController.js";
import { autenticarToken, autorizarFuncionario } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticarToken);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", autorizarFuncionario, update);
router.patch("/:id", autorizarFuncionario, update);
router.delete("/:id", autorizarFuncionario, destroy);

export default router;

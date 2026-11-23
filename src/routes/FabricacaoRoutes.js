import { Router } from "express";
import { getAll, getById, create, update, destroy } from "../controller/FabricacaoController.js";
import { autenticarToken, autorizarFuncionario } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(autenticarToken, autorizarFuncionario);
router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;

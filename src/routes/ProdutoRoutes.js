import { Router } from "express";
import {
    getAll,
    getById,
    create,
    update,
    destroy
} from "../controller/ProdutoController.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", destroy);

export default router;

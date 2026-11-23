import { Router } from "express";
import {
    getAll,
    getById,
    create,
    update,
    updateStatus,
    destroy
} from "../controller/OrdemFabricacaoController.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/status", updateStatus);
router.delete("/:id", destroy);

export default router;

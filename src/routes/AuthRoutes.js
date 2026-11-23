import { Router } from "express";
import { login, me } from "../controller/AuthController.js";
import { autenticarToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", autenticarToken, me);

export default router;

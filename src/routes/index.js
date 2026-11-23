import { Router } from "express";
import InsumoRoutes from "./InsumoRoutes.js";
import ProdutoRoutes from "./ProdutoRoutes.js";
import ReceitaRoutes from "./ReceitaRoutes.js";
import ClienteRoutes from "./ClienteRoutes.js";
import FuncionarioRoutes from "./FuncionarioRoutes.js";

const routes = Router();

routes.use("/insumos", InsumoRoutes);
routes.use("/produtos", ProdutoRoutes);
routes.use("/receitas", ReceitaRoutes);
routes.use("/clientes", ClienteRoutes);
routes.use("/funcionarios", FuncionarioRoutes);

export default routes;

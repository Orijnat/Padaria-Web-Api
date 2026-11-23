import { Router } from "express";
import InsumoRoutes from "./InsumoRoutes.js";
import ProdutoRoutes from "./ProdutoRoutes.js";
import ReceitaRoutes from "./ReceitaRoutes.js";
import UsuarioRoutes from "./UsuarioRoutes.js";
import AuthRoutes from "./AuthRoutes.js";
import CategoriaRoutes from "./CategoriaRoutes.js";
import FuncionarioRoutes from "./FuncionarioRoutes.js";
import FabricacaoRoutes from "./FabricacaoRoutes.js";
import PedidoRoutes from "./PedidoRoutes.js";

const routes = Router();

routes.use("/insumos", InsumoRoutes);
routes.use("/produtos", ProdutoRoutes);
routes.use("/receitas", ReceitaRoutes);
routes.use("/usuarios", UsuarioRoutes);
routes.use("/auth", AuthRoutes);
routes.use("/categorias", CategoriaRoutes);
routes.use("/funcionarios", FuncionarioRoutes);
routes.use("/fabricacoes", FabricacaoRoutes);
routes.use("/pedidos", PedidoRoutes);

export default routes;

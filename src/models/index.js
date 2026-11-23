import Cliente from "./ClienteModel.js";
import Insumo from "./InsumoModel.js";
import Produto from "./ProdutoModel.js";
import Receita from "./ReceitaModel.js";
import Funcionario from "./FuncionarioModel.js";
import OrdemFabricacao from "./OrdemFabricacaoModel.js";

(async () => {
    // await Cliente.sync();
    // await Insumo.sync();
    // await Produto.sync();
    // await Receita.sync();
    // await Funcionario.sync();
    // await OrdemFabricacao.sync();
})();

export { Cliente, Insumo, Produto, Receita, Funcionario, OrdemFabricacao };

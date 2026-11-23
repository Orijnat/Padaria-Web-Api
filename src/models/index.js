import Insumo from "./InsumoModel.js";
import Produto from "./ProdutoModel.js";
import Receita from "./ReceitaModel.js";
import ReceitaIngrediente from "./ReceitaIngredienteModel.js";
import Categoria from "./CategoriaModel.js";
import Funcionario from "./FuncionarioModel.js";
import Fabricacao from "./FabricacaoModel.js";
import Pedido from "./PedidoModel.js";
import PedidoItem from "./PedidoItemModel.js";
import Usuario, { usuarioPublico } from "./UsuarioModel.js";

// ============================================
// DEFINIÇÃO DOS RELACIONAMENTOS (ASSOCIAÇÕES)
// ============================================

// 1. Categoria & Produto / Receita
Categoria.hasMany(Produto, { foreignKey: 'categoriaId', as: 'produtos', onDelete: 'SET NULL' });
Produto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria', onDelete: 'SET NULL' });

Categoria.hasMany(Receita, { foreignKey: 'categoriaId', as: 'receitas', onDelete: 'SET NULL' });
Receita.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria', onDelete: 'SET NULL' });

// 2. Receita & Produto
Receita.hasMany(Produto, { foreignKey: 'receitaId', as: 'produtos', onDelete: 'SET NULL' });
Produto.belongsTo(Receita, { foreignKey: 'receitaId', as: 'receita', onDelete: 'SET NULL' });

// 3. Receita & Insumo via ReceitaIngrediente (Ficha Técnica)
Receita.hasMany(ReceitaIngrediente, { foreignKey: 'receitaId', as: 'ingredientes', onDelete: 'CASCADE' });
ReceitaIngrediente.belongsTo(Receita, { foreignKey: 'receitaId', as: 'receita', onDelete: 'CASCADE' });

Insumo.hasMany(ReceitaIngrediente, { foreignKey: 'insumoId', as: 'receitas_uso', onDelete: 'RESTRICT' });
ReceitaIngrediente.belongsTo(Insumo, { foreignKey: 'insumoId', as: 'insumo', onDelete: 'RESTRICT' });

// 4. Fabricação (Ordem de Produção)
Produto.hasMany(Fabricacao, { foreignKey: 'produtoId', as: 'fabricacoes', onDelete: 'RESTRICT' });
Fabricacao.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto', onDelete: 'RESTRICT' });

Funcionario.hasMany(Fabricacao, { foreignKey: 'funcionarioId', as: 'fabricacoes', onDelete: 'SET NULL' });
Fabricacao.belongsTo(Funcionario, { foreignKey: 'funcionarioId', as: 'funcionario', onDelete: 'SET NULL' });

// 5. Pedidos & Itens de Venda (cliente = usuario de tipo 'cliente')
Usuario.hasMany(Pedido, { foreignKey: 'clienteId', as: 'pedidos', onDelete: 'SET NULL' });
Pedido.belongsTo(Usuario, { foreignKey: 'clienteId', as: 'cliente', onDelete: 'SET NULL' });

Pedido.hasMany(PedidoItem, { foreignKey: 'pedidoId', as: 'itens', onDelete: 'CASCADE' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido', onDelete: 'CASCADE' });

Produto.hasMany(PedidoItem, { foreignKey: 'produtoId', as: 'itens_pedido', onDelete: 'RESTRICT' });
PedidoItem.belongsTo(Produto, { foreignKey: 'produtoId', as: 'produto', onDelete: 'RESTRICT' });

export {
    Insumo,
    Produto,
    Receita,
    ReceitaIngrediente,
    Categoria,
    Funcionario,
    Fabricacao,
    Pedido,
    PedidoItem,
    Usuario,
    usuarioPublico
};

export default {
    Insumo,
    Produto,
    Receita,
    ReceitaIngrediente,
    Categoria,
    Funcionario,
    Fabricacao,
    Pedido,
    PedidoItem,
    Usuario,
    usuarioPublico
};

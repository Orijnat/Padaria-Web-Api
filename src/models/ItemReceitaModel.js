import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";
import Produto from "./ProdutoModel.js";
import Insumo from "./InsumoModel.js";

const ItemReceita = sequelize.define(
    'itens_receita',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quantidade_necessaria: {
            type: DataTypes.FLOAT,
            allowNull: false,
            name: 'quantidadeNecessaria',
            field: 'quantidade_necessaria'
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

ItemReceita.belongsTo(Produto, {
    as: 'produto',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    foreignKey: {
        name: 'idProduto',
        allowNull: false,
        field: 'produto_id'
    }
});

ItemReceita.belongsTo(Insumo, {
    as: 'insumo',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    foreignKey: {
        name: 'idInsumo',
        allowNull: false,
        field: 'insumo_id'
    }
});

export default ItemReceita;

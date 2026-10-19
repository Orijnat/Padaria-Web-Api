import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";
import Produto from "./ProdutoModel.js";
import Insumo from "./InsumoModel.js";

const Receita = sequelize.define(
    'receitas',
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

Receita.belongsTo(Produto, {
    as: 'produto',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    foreignKey: {
        name: 'idProduto',
        allowNull: false,
        field: 'produto_id'
    }
});

Receita.belongsTo(Insumo, {
    as: 'insumo',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    foreignKey: {
        name: 'idInsumo',
        allowNull: false,
        field: 'insumo_id'
    }
});

export default Receita;

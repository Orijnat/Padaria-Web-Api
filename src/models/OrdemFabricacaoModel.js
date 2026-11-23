import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";
import Produto from "./ProdutoModel.js";
import Funcionario from "./FuncionarioModel.js";

const OrdemFabricacao = sequelize.define(
    'ordens_fabricacao',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        data_producao: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        quantidade: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'planejado'
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

// Cada ordem é de UM produto e tem UM funcionário responsável
OrdemFabricacao.belongsTo(Produto, {
    as: 'produto',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    foreignKey: {
        name: 'produtoId',
        allowNull: false,
        field: 'produto_id'
    }
});

OrdemFabricacao.belongsTo(Funcionario, {
    as: 'funcionario',
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    foreignKey: {
        name: 'funcionarioId',
        allowNull: false,
        field: 'funcionario_id'
    }
});

export default OrdemFabricacao;

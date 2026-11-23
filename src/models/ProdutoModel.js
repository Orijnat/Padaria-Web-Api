import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Produto = sequelize.define(
    'produtos',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        categoria_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'categoria_id'
        },
        receita_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'receita_id'
        },
        preco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        estoque: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        emoji: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: '🥖'
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Produto;

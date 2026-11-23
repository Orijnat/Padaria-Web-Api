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
            allowNull: false,
            validate: { notEmpty: true, len: [1, 150] }
        },
        categoriaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'categoria_id'
        },
        receitaId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'receita_id'
        },
        preco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 },
            get() { const v = this.getDataValue('preco'); return v == null ? v : parseFloat(v); }
        },
        estoque: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: { min: 0, isInt: true }
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

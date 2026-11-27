import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Categoria = sequelize.define(
    'categorias',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: { notEmpty: true, len: [1, 100] }
        },
        descricao: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        emoji: {
            type: DataTypes.STRING(10),
            allowNull: true,
            defaultValue: ''
        },
        cor: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '#c48d4a'
        },
        ativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Categoria;

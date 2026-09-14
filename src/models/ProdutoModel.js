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
        preco: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        estoque: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Produto;

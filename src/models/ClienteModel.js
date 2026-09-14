import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Cliente = sequelize.define(
    'clientes',
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
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        endereco: {
            type: DataTypes.STRING(255),
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Cliente;

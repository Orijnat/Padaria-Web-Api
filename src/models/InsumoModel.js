import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Insumo = sequelize.define(
    'insumos',
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
        unidade_medida: {
            type: DataTypes.STRING(20),
            allowNull: false,
            name: 'unidadeMedida',
            field: 'unidade_medida'
        },
        quantidade_atual: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            name: 'quantidadeAtual',
            field: 'quantidade_atual'
        },
        estoque_minimo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            name: 'estoqueMinimo',
            field: 'estoque_minimo'
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Insumo;

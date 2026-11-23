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
            allowNull: false,
            unique: true,
            validate: { notEmpty: true, len: [1, 150] }
        },
        unidadeMedida: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'unidade_medida',
            validate: { notEmpty: true }
        },
        quantidadeAtual: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            field: 'quantidade_atual',
            validate: { min: 0 }
        },
        estoqueMinimo: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            field: 'estoque_minimo',
            validate: { min: 0 }
        },
        custo: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: { min: 0 },
            get() { const v = this.getDataValue('custo'); return v == null ? v : parseFloat(v); }
        },
        fornecedor: {
            type: DataTypes.STRING(150),
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Insumo;

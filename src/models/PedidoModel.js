import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Pedido = sequelize.define(
    'pedidos',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        clienteId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'cliente_id'
        },
        clienteNome: {
            type: DataTypes.STRING(150),
            allowNull: true,
            field: 'cliente_nome'
        },
        clienteEmail: {
            type: DataTypes.STRING(150),
            allowNull: true,
            field: 'cliente_email'
        },
        data: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'pendente', // 'pendente', 'preparando', 'pronto', 'entregue', 'cancelado'
            validate: { isIn: [['pendente', 'preparando', 'pronto', 'entregue', 'cancelado']] }
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: { min: 0 },
            get() { const v = this.getDataValue('total'); return v == null ? v : parseFloat(v); }
        },
        observacao: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Pedido;

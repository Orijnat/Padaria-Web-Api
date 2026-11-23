import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const PedidoItem = sequelize.define(
    'pedido_itens',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        pedidoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'pedido_id'
        },
        produtoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'produto_id'
        },
        quantidade: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: { min: 1, isInt: true }
        },
        precoUnit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'preco_unit',
            validate: { min: 0 },
            get() { const v = this.getDataValue('precoUnit'); return v == null ? v : parseFloat(v); }
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            { name: 'pedido_itens_pedido_id_produto_id_key', unique: true, fields: ['pedido_id', 'produto_id'] }
        ]
    }
);

export default PedidoItem;

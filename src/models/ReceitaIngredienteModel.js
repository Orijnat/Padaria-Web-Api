import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const ReceitaIngrediente = sequelize.define(
    'receita_ingredientes',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        receitaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'receita_id'
        },
        insumoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'insumo_id'
        },
        quantidade: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 0,
            validate: { quantidadePositiva(value) {
                if (!(Number(value) > 0)) throw new Error('A quantidade do ingrediente deve ser maior que zero.');
            } }
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
        indexes: [
            { name: 'receita_ingredientes_receita_id_insumo_id_key', unique: true, fields: ['receita_id', 'insumo_id'] }
        ]
    }
);

export default ReceitaIngrediente;

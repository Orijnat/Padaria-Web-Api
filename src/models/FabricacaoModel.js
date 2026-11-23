import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Fabricacao = sequelize.define(
    'fabricacoes',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        produtoId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'produto_id'
        },
        funcionarioId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'funcionario_id'
        },
        data: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        quantidade: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1,
            validate: { quantidadePositiva(value) {
                if (!(Number(value) > 0)) throw new Error('A quantidade deve ser maior que zero.');
            } }
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'planejado', // 'planejado', 'em_producao', 'concluido', 'cancelado'
            validate: { isIn: [['planejado', 'em_producao', 'concluido', 'cancelado']] }
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Fabricacao;

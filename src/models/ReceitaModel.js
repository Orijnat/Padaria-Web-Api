import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Receita = sequelize.define(
    'receitas',
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
        rendimento: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            defaultValue: 1,
            validate: { quantidadePositiva(value) {
                if (!(Number(value) > 0)) throw new Error('O rendimento deve ser maior que zero.');
            } }
        },
        unidadeRendimento: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'unidades',
            field: 'unidade_rendimento'
        },
        tempoPreparo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'tempo_preparo',
            validate: { min: 0, isInt: true }
        },
        instrucoes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

export default Receita;

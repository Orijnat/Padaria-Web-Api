import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Funcionario = sequelize.define(
    'funcionarios',
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
        cpf: {
            type: DataTypes.STRING(14),
            allowNull: false,
            unique: true
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        cargo: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        data_admissao: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            name: 'dataAdmissao',
            field: 'data_admissao'
        },
        salario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
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

export default Funcionario;

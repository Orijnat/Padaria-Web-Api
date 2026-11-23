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
        cargo: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: true,
            unique: true
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        cpf: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        dataAdmissao: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            field: 'data_admissao'
        },
        salario: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
            validate: { min: 0 },
            get() { const v = this.getDataValue('salario'); return v == null ? v : parseFloat(v); }
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

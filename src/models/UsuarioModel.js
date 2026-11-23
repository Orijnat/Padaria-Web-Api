import { sequelize } from "../config/index.js";
import { DataTypes } from "sequelize";

const Usuario = sequelize.define(
    'usuarios',
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
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        senhaHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'senha_hash'
        },
        telefone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        cpf: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        tipo: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'cliente',
            validate: { isIn: [['cliente', 'funcionario']] }
        },
        criadoEm: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'criado_em'
        },
        atualizadoEm: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            field: 'atualizado_em'
        }
    },
    {
        freezeTableName: true,
        timestamps: false
    }
);

/**
 * Retorna os dados públicos do usuário (sem a hash da senha).
 */
export function usuarioPublico(usuario) {
    if (!usuario) return null;
    const obj = usuario.toJSON ? usuario.toJSON() : { ...usuario };
    delete obj.senhaHash;
    delete obj.senha_hash;
    return obj;
}

export default Usuario;

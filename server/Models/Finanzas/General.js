/**
 *
 * @title:             Líneas de crédito
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Línea de Crédito Model
 *
 **/

const { Model, DataTypes } = require('sequelize');
const { sql } = require('../../config/sql');


// ===============================================
// Tipos de entidad financiera model
// ===============================================
class TipoDeEntidad extends Model {};
TipoDeEntidad.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tipoDeEntidad: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'tipos_de_entidad',
    modelName: 'tipos_de_entidad'
});

// ===============================================
// Entidad financiera model
// ===============================================
class EntidadFinanciera extends Model {};
EntidadFinanciera.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    nombreEntidad: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'entidades_financieras',
    modelName: 'entidades_financieras'
});

EntidadFinanciera.belongsTo(TipoDeEntidad, {
    foreignKey: 'tipoDeEntidad'
});

// ===============================================
// Empresa Grupo Model
// ===============================================
class EmpresaGrupo extends Model {};
EmpresaGrupo.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    empresa: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'empresas_grupo',
    modelName: 'empresas_grupo'
});

module.exports = {
    TipoDeEntidad,
    EntidadFinanciera,
    EmpresaGrupo
}
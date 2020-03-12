/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/


const { Model, DataTypes } = require('sequelize');
const { sql } = require('../config/sql');

// ===============================================
// External Models
// ===============================================
const { Proyecto } = require('./Proyectos');


// ===============================================
// Personnel model
// ===============================================
class Personal extends Model {};
Personal.init({
    idPersonal: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING
    },
    carnet: {
        type: DataTypes.STRING
    },
    cargo: {
        type: DataTypes.STRING
    },
    turno: {
        type: DataTypes.ENUM(['Nocturno', 'Diurno', 'Tarde'])
    },
    lugarDeTrabajo: {
        type: DataTypes.STRING
    },
    seccion: {
        type: DataTypes.STRING
    },
    diasLaborales: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'personal',
    timestamps: false,
    tableName: 'personal'
});

Personal.belongsTo(Proyecto, {
    foreignKey: 'proyecto_id'
});

Personal.belongsTo(Personal, {
    foreignKey: 'superior'
});


class Supervisor extends Model {};
Supervisor.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    zona: {
        type: DataTypes.STRING
    },
    descripcion: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'supervisores',
    timestamps: false,
    tableName: 'supervisores'
});

Supervisor.belongsTo(Personal, {
    foreignKey: 'supervisor'
});

// ===============================================
// Export Personal model
// ===============================================
module.exports = {
    Personal,
    Supervisor
}
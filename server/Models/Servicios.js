/**
 *
 * @title:             Servicios
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Database Model for "Servicios" table in LPL Database
 *
 **/


const { Model, DataTypes } = require('sequelize');
const { sql } = require('../config/sql');

// ===============================================
// External Models
// ===============================================
const { Vehiculo } = require('./Vehicle');

// ===============================================
// Servicio Model
// ===============================================
class Servicio extends Model {};
Servicio.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    servicio: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'servicios',
    timestamps: false,
    tableName: 'servicios'
});

// ===============================================
// Vehiculos Servicios middle Model
// ===============================================
class VehiculosServicios extends Model {};
VehiculosServicios.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'vehiculos_servicios',
    tableName: 'vehiculos_servicios',
    timestamps: false
});

VehiculosServicios.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

VehiculosServicios.belongsTo(Servicio, {
    foreignKey: 'servicio_id'
});

// Export model
module.exports = {
    Servicio,
    VehiculosServicios
};
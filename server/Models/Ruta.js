/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/

const { Model, DataTypes } = require('sequelize');
const { sql } = require('../config/sql');

// ===============================================
// External Model
// ===============================================
const { TipoDeVehiculo, Vehiculo } = require('../Models/Vehicle');
const { Servicio } = require('../Models/Servicios');

/*
// ===============================================
// servicios válidos
// ===============================================
let tipoDeServicio = {
    values: ['Recoleccion', 'Transferencia', 'Lavado', 'Barrido Mecanizado', 'Transporte', 'Supervisión', 'Mantenimiento', 'Autosocorro', 'Administración'],
    message: '{VALUE} no es un servicio válido'
};
*/

// ===============================================
// Modelo de Ruta
// ===============================================
class Ruta extends Model {};
Ruta.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    ruta: {
        type: DataTypes.STRING,
        unique: true
    },
    referencia: {
        type: DataTypes.STRING
    },
    zona: {
        type: DataTypes.STRING
    },
    turno: {
        type: DataTypes.ENUM(['Nocturno', 'Diurno', 'Tarde'])
    },
    frecuencia: {
        type: DataTypes.STRING
    },
    descripcionServicio: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    modelName: 'rutas',
    tableName: 'rutas'
});

Ruta.belongsTo(TipoDeVehiculo, {
    foreignKey: 'tipoDeVehiculos'
});

Ruta.belongsTo(Servicio, {
    foreignKey: 'servicio_id'
});

class VehiculosRutas extends Model {};
VehiculosRutas.init({
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
    timestamps: false,
    modelName: 'vehiculos_rutas',
    tableName: 'vehiculos_rutas'
});

VehiculosRutas.belongsTo(Ruta, {
    foreignKey: 'ruta_id'
});

VehiculosRutas.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

// ===============================================
// Export Ruta model
// ===============================================
module.exports = {
    Ruta,
    VehiculosRutas
}
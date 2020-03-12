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
const { Personal } = require('./Personal');
const { Vehiculo } = require('./Vehicle');


// ===============================================
// Personnel model
// ===============================================
class Conductor extends Model {};
Conductor.init({
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
    modelName: 'conductores',
    timestamps: false,
    tableName: 'conductores'
});

Conductor.belongsTo(Personal, {
    foreignKey: 'personal_id'
});

Conductor.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

// ===============================================
// Export Conductor model
// ===============================================
module.exports = {
    Conductor
};
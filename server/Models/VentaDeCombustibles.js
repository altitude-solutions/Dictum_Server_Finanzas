/**
 *
 * @title:             Venta de Combustibles
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Venta de Combustibles Models
 *
 **/

// Sequelize instance
const { sql } = require('../config/sql');
// Sequelize model and datatypes
const { Model, DataTypes } = require('sequelize');

// Related models
const { Vehiculo } = require('./Vehicle');
const { Usuario } = require('./User');


// ===============================================
// Venta de combustible model
// ===============================================
class VentaDeCombustible extends Model {};
VentaDeCombustible.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    producto: {
        type: DataTypes.ENUM(['Diesel', 'Gasolina'])
    },
    litros: {
        type: DataTypes.FLOAT
    },
    precioTotal: {
        type: DataTypes.FLOAT
    },
    fechaYHora: {
        type: DataTypes.BIGINT
    },
    kilometraje: {
        type: DataTypes.FLOAT
    },
    comentarios: {
        type: DataTypes.STRING(1023)
    }
}, {
    tableName: 'venta_de_combustible',
    modelName: 'venta_de_combustible',
    timestamps: false,
    sequelize: sql
});

VentaDeCombustible.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

VentaDeCombustible.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});


module.exports = {
    VentaDeCombustible
};
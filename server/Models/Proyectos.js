/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/

const { Model, DataTypes } = require('sequelize');
const { sql } = require('../config/sql');

// ===============================================
// Vehicule Model
// ===============================================
class Proyecto extends Model {};
Proyecto.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    proyecto: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'proyectos',
    timestamps: false,
    tableName: 'proyectos'
});

// ===============================================
// Export Usuario model
// ===============================================
module.exports = {
    Proyecto
}
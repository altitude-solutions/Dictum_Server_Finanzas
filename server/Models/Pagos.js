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
class MotivosDePago extends Model {};
MotivosDePago.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    motivo: {
        type: DataTypes.STRING
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'motivos_de_pago',
    timestamps: false,
    tableName: 'motivos_de_pago'
});

// ===============================================
// Export Motivos model
// ===============================================
module.exports = {
    MotivosDePago
}
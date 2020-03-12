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
// Externale models
// ===============================================
const { EmpresaGrupo, EntidadFinanciera } = require('./General');

// ===============================================
// Linea de credito model
// ===============================================
class LineasDeCredito extends Model {};
LineasDeCredito.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: {
        type: DataTypes.STRING,
        unique: true
    },
    moneda: {
        type: DataTypes.STRING
    },
    fechaFirma: {
        type: DataTypes.BIGINT
    },
    fechaVencimiento: {
        type: DataTypes.BIGINT
    },
    monto: {
        type: DataTypes.FLOAT
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    timestamps: false,
    tableName: 'lineas_de_credito',
    modelName: 'lineas_de_credito'
});

LineasDeCredito.belongsTo(EntidadFinanciera, {
    foreignKey: 'entidad'
});

LineasDeCredito.belongsTo(EmpresaGrupo, {
    foreignKey: 'empresaGrupo'
});


// ===============================================
// Export models
// ===============================================
module.exports = {
    LineasDeCredito
};
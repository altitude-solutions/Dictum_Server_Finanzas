/**
 *
 * @title:             Models Operador Base
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Model
 *
 **/

const { sql } = require('../config/sql');
const { Vehiculo } = require('./Vehicle');
const { Personal } = require('./Personal');
const { Usuario } = require('./User');
const { Ruta } = require('./Ruta');
const { DataTypes, Model } = require('sequelize');


class OperadorBase extends Model {};
OperadorBase.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    kilometrajeSalida: {
        type: DataTypes.FLOAT
    },
    kilometrajeEntrada: {
        type: DataTypes.FLOAT
    },
    comentarios: {
        type: DataTypes.STRING(1023)
    },
    fecha: {
        type: DataTypes.BIGINT
    }
}, {
    tableName: 'registro_de_operador_base',
    modelName: 'registro_de_operador_base',
    timestamps: false,
    sequelize: sql
});

OperadorBase.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

OperadorBase.belongsTo(Personal, {
    foreignKey: 'conductor',
    as: 'conductor_id'
})
OperadorBase.belongsTo(Personal, {
    foreignKey: 'ayudante_1',
    as: 'ayudante_1_id'
});

OperadorBase.belongsTo(Personal, {
    foreignKey: 'ayudante_2',
    as: 'ayudante_2_id'
});

OperadorBase.belongsTo(Personal, {
    foreignKey: 'ayudante_3',
    as: 'ayudante_3_id'
});

OperadorBase.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

OperadorBase.belongsTo(Ruta, {
    foreignKey: 'ruta_id'
});

module.exports = {
    OperadorBase
};
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
const { MotivosDePago } = require('./Pagos');


// ===============================================
// CodigoTipoDeVehiculo
// ===============================================
class TipoDeVehiculo extends Model {};
TipoDeVehiculo.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    tipo: {
        type: DataTypes.STRING,
        unique: true
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'tipos_de_vehiculo',
    tableName: 'tipos_de_vehiculo',
    timestamps: false
});

// ===============================================
// CodigoTipoDeVehiculo
// ===============================================
class CodigoTipoDeVehiculo extends Model {};
CodigoTipoDeVehiculo.init({
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
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'codigos_tipos_de_vehiculo',
    tableName: 'codigos_tipos_de_vehiculo',
    timestamps: false
});

CodigoTipoDeVehiculo.belongsTo(TipoDeVehiculo, {
    foreignKey: 'tipo'
});

// ===============================================
// Vehicule Model
// ===============================================
class Vehiculo extends Model {};
Vehiculo.init({
    movil: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    placa: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    descripcion: {
        type: DataTypes.STRING
    },
    cargaToneladas: {
        type: DataTypes.FLOAT
    },
    cargaMetrosCubicos: {
        type: DataTypes.FLOAT
    },
    cargaLitros: {
        type: DataTypes.FLOAT
    },
    marca: {
        type: DataTypes.STRING
    },
    modelo: {
        type: DataTypes.STRING
    },
    version: {
        type: DataTypes.STRING
    },
    anio: {
        type: DataTypes.INTEGER
    },
    cilindrada: {
        type: DataTypes.FLOAT
    },
    traccion: {
        type: DataTypes.STRING
    },
    peso: {
        type: DataTypes.FLOAT
    },
    combustible: {
        type: DataTypes.ENUM(['Diesel', 'Gasolina'])
    },
    ruedas: {
        type: DataTypes.INTEGER
    },
    motor: {
        type: DataTypes.STRING
    },
    turbo: {
        type: DataTypes.STRING
    },
    chasis: {
        type: DataTypes.STRING
    },
    serie: {
        type: DataTypes.STRING
    },
    color: {
        type: DataTypes.STRING
    },
    numeroDeAyudantes: {
        type: DataTypes.INTEGER
    },
    capacidadCombustible: {
        type: DataTypes.FLOAT
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'vehiculos',
    timestamps: false,
    tableName: 'vehiculos'
});

Vehiculo.belongsTo(CodigoTipoDeVehiculo, {
    foreignKey: 'codTipoDeVehiculo'
});

Vehiculo.belongsTo(Proyecto, {
    foreignKey: 'proyecto_id'
});

Vehiculo.belongsTo(MotivosDePago, {
    foreignKey: 'pagos'
});

// ===============================================
// Export Usuario model
// ===============================================
module.exports = {
    Vehiculo,
    CodigoTipoDeVehiculo,
    TipoDeVehiculo
}
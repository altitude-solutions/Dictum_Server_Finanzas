/**
 *
 * @title:             Operador de radios registers
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Operador de radio models
 *
 **/


const { Model, DataTypes } = require('sequelize');
// sequelize instance
const { sql } = require('../config/sql');

// ===============================================
// External models
// ===============================================
const { Vehiculo } = require('./Vehicle');
const { Ruta } = require('./Ruta');
const { Usuario } = require('./User');
const { Personal, Supervisor } = require('./Personal');


// ===============================================
// Registro de horarios models
// ===============================================
class RegistroDeHorarios extends Model {};
class CicloDeHorarios extends Model {};

RegistroDeHorarios.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    ayudantes: {
        type: DataTypes.INTEGER
    }
}, {
    sequelize: sql,
    timestamps: false,
    modelName: 'registro_de_horarios',
    tableName: 'registro_de_horarios'
});


RegistroDeHorarios.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

RegistroDeHorarios.belongsTo(Ruta, {
    foreignKey: 'ruta_id'
});

RegistroDeHorarios.belongsTo(Personal, {
    foreignKey: 'conductor'
});

RegistroDeHorarios.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

CicloDeHorarios.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    salidaBase: {
        type: DataTypes.BIGINT
    },
    inicioRuta: {
        type: DataTypes.BIGINT
    },
    finRuta: {
        type: DataTypes.BIGINT
    },
    abandonoRuta: {
        type: DataTypes.BIGINT
    },
    salidaRelleno: {
        type: DataTypes.BIGINT
    },
    ingresoRelleno: {
        type: DataTypes.BIGINT
    },
    inicioAlmuerzo: {
        type: DataTypes.BIGINT
    },
    finalAlmuerzo: {
        type: DataTypes.BIGINT
    },
    regresoBase: {
        type: DataTypes.BIGINT
    },
    comentarios: {
        type: DataTypes.STRING(1023)
    },
    modificaciones: {
        type: DataTypes.STRING(1023)
    }
}, {
    sequelize: sql,
    timestamps: false,
    modelName: 'ciclo_de_horarios',
    tableName: 'ciclo_de_horarios'
});

CicloDeHorarios.belongsTo(RegistroDeHorarios, {
    foreignKey: 'parent'
});
// RegistroDeHorarios.hasMany(CicloDeHorarios, {
//     foreignKey: 'parent'
// });


// ===============================================
// Registro De Penalidades models
// ===============================================
class RegistroDePenalidades extends Model {};
class RegistroDeDatos_OR extends Model {};
class ListaDeDatos_OR extends Model {};
RegistroDePenalidades.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    item: {
        type: DataTypes.STRING
    },
    tipoDePenalidad: {
        type: DataTypes.STRING
    },
    detalle: {
        type: DataTypes.STRING(1023)
    },
    comentarios: {
        type: DataTypes.STRING(1023)
    },
    sigma: {
        type: DataTypes.STRING
    },
    horaDeRecepcion: {
        type: DataTypes.BIGINT
    },
    horaDeRespuesta: {
        type: DataTypes.BIGINT
    },
    respuesta: {
        type: DataTypes.STRING(1023)
    },
    horaDeContrarespuesta: {
        type: DataTypes.BIGINT
    },
    contrarespuesta: {
        type: DataTypes.STRING(1023)
    }
}, {
    sequelize: sql,
    timestamps: false,
    modelName: 'registro_de_penalidades',
    tableName: 'registro_de_penalidades'
});

RegistroDePenalidades.belongsTo(Ruta, {
    foreignKey: 'ruta_id'
});

RegistroDePenalidades.belongsTo(Vehiculo, {
    foreignKey: 'movil'
});

RegistroDePenalidades.belongsTo(Supervisor, {
    foreignKey: 'supervisor'
});

RegistroDePenalidades.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

ListaDeDatos_OR.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    dato: {
        type: DataTypes.STRING
    }
}, {
    sequelize: sql,
    timestamps: false,
    modelName: 'lista_de_datos_or',
    tableName: 'lista_de_datos_or'
});

RegistroDeDatos_OR.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    idDiario: {
        type: DataTypes.STRING
    },
    sigmaDeRecepcion: {
        type: DataTypes.STRING
    },
    horaDeRecepcion: {
        type: DataTypes.BIGINT
    },
    zona: {
        type: DataTypes.STRING(1023)
    },
    direccion: {
        type: DataTypes.STRING(1023)
    },
    cantidadPoda: {
        type: DataTypes.STRING
    },
    detalle: {
        type: DataTypes.STRING
    },
    comentarios: {
        type: DataTypes.STRING
    },
    tipoDeContenedor: {
        type: DataTypes.STRING
    },
    codigoDeContenedor: {
        type: DataTypes.STRING
    },
    Mantenimiento: {
        type: DataTypes.STRING
    },
    horaComunicacion: {
        type: DataTypes.BIGINT
    },
    horaEjecucion: {
        type: DataTypes.BIGINT
    },
    horaVerificacion: {
        type: DataTypes.BIGINT
    },
    horaConciliacion: {
        type: DataTypes.BIGINT
    },
    sigmaDeConciliacion: {
        type: DataTypes.STRING
    }
}, {
    sequelize: sql,
    timestamps: false,
    modelName: 'registro_de_datos_or',
    tableName: 'registro_de_datos_or'
});

RegistroDeDatos_OR.belongsTo(ListaDeDatos_OR, {
    foreignKey: 'dato'
});

RegistroDeDatos_OR.belongsTo(Personal, {
    foreignKey: 'responsableComunicacion',
    as: 'resCom'
});

RegistroDeDatos_OR.belongsTo(Personal, {
    foreignKey: 'responsableEjecucion',
    as: 'resEje'
});

RegistroDeDatos_OR.belongsTo(Supervisor, {
    foreignKey: 'supervisor'
});

RegistroDeDatos_OR.belongsTo(Usuario, {
    foreignKey: 'usuario_id'
});

module.exports = {
    RegistroDeHorarios,
    CicloDeHorarios,
    RegistroDePenalidades,
    RegistroDeDatos_OR,
    ListaDeDatos_OR
}
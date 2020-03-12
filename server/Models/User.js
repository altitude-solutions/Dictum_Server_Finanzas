/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/



const { Model, DataTypes } = require('sequelize');
const { sql } = require('../config/sql');

/*
// ===============================================
// Permisos válidos
// ===============================================
let validEmployeeRoles = {
    values: [
        'es_leer', 'es_escribir', 'es_borrar', 'es_modificar', // estación de servicio
        'or_leer', 'or_escribir', 'or_borrar', 'or_modificar', // operador de radio
        'u_leer', 'u_escribir', 'u_borrar', 'u_modificar', // usuarios
        'ru_leer', 'ru_escribir', 'ru_borrar', 'ru_modificar', // rutas
        'p_leer', 'p_escribir', 'p_borrar', 'p_modificar', // personal
        've_leer', 've_escribir', 've_borrar', 've_modificar', // vehículos
        'io_leer', 'io_escribir', 'io_borrar', 'io_modificar', // Entradas y salidas
        'fin_leer', 'fin_escribir', 'fin_borrar', 'fin_modificar' // Finanzas
    ],
    message: '{VALUE} no es un permiso válido'
}
*/

// ===============================================
// Usuario Model
// ===============================================
class Usuario extends Model {};
Usuario.init({
    nombreUsuario: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    },
    permisos: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contra: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recuperacion: {
        type: DataTypes.STRING
    },
    correo: {
        type: DataTypes.STRING
    },
    empresa: {
        type: DataTypes.STRING
    },
    nombreReal: {
        type: DataTypes.STRING,
        allowNull: false
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize: sql,
    modelName: 'usuarios',
    timestamps: false,
    tableName: 'usuarios'
});


// ===============================================
// Export Usuario model
// ===============================================
module.exports = {
    Usuario
}
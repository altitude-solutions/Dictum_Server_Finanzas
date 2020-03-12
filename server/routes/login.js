/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// ===============================================
// User model
// ===============================================0
const { Usuario } = require('../Models/User');

// ===============================================
// Permisos Builder
// ===============================================
const { construirPermisos } = require('../classes/Permisos');

const { DataTypes } = require('sequelize');

// ===============================================
// Login service
// ===============================================
app.post('/login', (req, res) => {
    // request body
    let body = req.body;

    // verify if required fields are there, if not send bad request error
    if (!body.nombreUsuario || !body.contra) {
        return res.status(400).json({
            err: {
                message: 'El nombre de usuario y la contraseña son necesarios'
            }
        });
    }
    // Look for user in the database
    Usuario.findByPk(String(body.nombreUsuario), {
        attributes: ['nombreUsuario', 'permisos', 'nombreReal', 'contra', 'empresa', 'correo', 'estado']
    }).then(DbUser => {
        if (!DbUser) {
            return res.status(403).json({
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (DbUser.toJSON().nombreUsuario != body.nombreUsuario) {
            return res.status(403).json({
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.contra, DbUser.toJSON().contra)) {
            return res.status(403).json({
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        if (!DbUser.toJSON().estado) {
            return res.status(403).json({
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            });
        }

        DbUser.permisos = construirPermisos(DbUser.permisos);
        let token = jwt.sign({
            user: {
                nombreUsuario: DbUser.nombreUsuario,
                nombreReal: DbUser.nombreReal,
                permisos: DbUser.permisos,
                empresa: DbUser.empresa,
                correo: DbUser.correo
            }
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        // console.log(`${DbUser.nombreUsuario}(${DbUser.nombreReal}) ingresó al sistema: ${new Date().toLocaleString()}`);
        return res.json({
            user: {
                nombreUsuario: DbUser.nombreUsuario,
                nombreReal: DbUser.nombreReal,
                permisos: DbUser.permisos,
                empresa: DbUser.empresa,
                correo: DbUser.correo
            },
            token
        });
    }).catch(err => {
        console.log(err);
        return res.status(403).json({
            err
        });
    });
});

app.post('/recovery', (req, res) => {
    console.log(req.body);
    res.status(501).json({
        ok: true
    });
});

module.exports = app;
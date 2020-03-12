/**
 *
 * @title:             Users
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code will handle http requests from "Sistemas LPL" to create, update, get and delete users
 *
 **/

const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');
const jwt = require('jsonwebtoken');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../middlewares/authentication');
const { construirPermisos, empaquetarPermisos } = require('../classes/Permisos');

// Usuario Model

const { Usuario } = require('../Models/User');


// ===============================================
// Create user
// ===============================================
app.post('/users', (req, res) => {
    let body = req.body;
    if (!body.nombreUsuario || !body.nombreReal || !body.permisos || !body.contra || !body.recuperacion) {
        return res.status(400).json({
            err: {
                message: 'Los campos necesarios nombre de usuario, nombre real, permisos, contraseña, recuperacion'
            }
        });
    } else {
        // Pack permisos array into 0-1 string
        body.permisos = empaquetarPermisos(body.permisos);
        // Hash password for secure storage
        body.contra = bcrypt.hashSync(body.contra, 10);
        Usuario.count({}).then(count => {
            if (count > 0) {
                // There is at least one user. Then there is a root user
                // Verify token
                let token = req.get('token');
                jwt.verify(token, process.env.SEED, (err, decoded) => {
                    if (err) {
                        // wrong Token
                        return res.status(400).json({
                            err
                        });
                    } else {
                        // Token verifed
                        let user = decoded.user;
                        if (user.permisos.includes('u_escribir')) {
                            Usuario.create(body).then(DBuser => {
                                Usuario.findByPk(DBuser.get('nombreUsuario'), {
                                    attributes: ['nombreUsuario', 'permisos', 'nombreReal', 'empresa', 'correo']
                                }).then(returnUser => {
                                    returnUser.permisos = construirPermisos(returnUser.permisos);
                                    return res.json({
                                        user: returnUser
                                    });
                                }).catch(err => {
                                    console.log(err);
                                    return res.status(500).json({
                                        err
                                    });
                                });
                            }).catch(err => {
                                res.status(500).json({
                                    err
                                });
                            });
                        } else {
                            res.status(403).json({
                                err: {
                                    message: 'Acceso denegado'
                                }
                            });
                        }
                    }
                });
            } else {
                // There are no users then create root, Override permisos to create root user
                body.permisos = '1111 1111 1111 1111 1111 1111 1111 1111 1111';
                Usuario.create(body).then(DBuser => {
                    Usuario.findByPk(DBuser.get('nombreUsuario'), {
                        attributes: ['nombreUsuario', 'permisos', 'nombreReal', 'empresa', 'correo']
                    }).then(returnUser => {
                        returnUser.permisos = construirPermisos(returnUser.permisos);
                        return res.json({
                            user: returnUser
                        });
                    }).catch(err => {
                        console.log(err);
                        return res.status(500).json({
                            err
                        });
                    });
                }).catch(err => {
                    console.log(err);
                    return res.status(500).json({
                        err
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            return res.status(500).json({
                err
            });
        });
    }
});

// ===============================================
// Read user by id
// ===============================================
app.get('/users/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('u_leer')) {
        Usuario.findByPk(id, {
            attributes: ['nombreUsuario', 'permisos', 'nombreReal', 'empresa', 'correo', 'estado']
        }).then(dbUser => {
            if (!dbUser) {
                return res.status(404).json({
                    err: {
                        message: `${id} no encontrado`
                    }
                });
            }
            if (dbUser.nombreUsuario != id) {
                return res.status(404).json({
                    err: {
                        message: `${id} no encontrado`
                    }
                });
            }
            res.json({
                user: dbUser
            });
        }).catch(err => {
            return res.status(500).json({
                err
            });
        });
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

// ===============================================
// Get users
// Optional pagination
// Default 15 users from 0
// ===============================================
app.get('/users', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }

    let user = req.user;
    if (user.permisos.includes('u_leer')) {
        Usuario.count({})
            .then(count => {
                Usuario.findAll({
                    attributes: ['nombreUsuario', 'permisos', 'nombreReal', 'empresa', 'correo', 'estado'],
                    offset: from,
                    limit,
                    where
                }).then(users => {
                    for (let i = 0; i < users.length; i++) {
                        users[i].permisos = construirPermisos(users[i].permisos);
                    }
                    res.json({
                        users,
                        count
                    });
                }).catch(err => {
                    return res.status(500).json({
                        err
                    });
                });
            }).catch(err => {
                console.log(err);
                return res.status(500).json({
                    err
                });
            });
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

// ===============================================
// Update user
// ===============================================
app.put('/users/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['permisos', 'contra', 'empresa', 'recuperacion', 'correo', 'nombreReal', 'estado']);
    let id = req.params.id;
    let user = req.user;

    if (user.permisos.includes('u_modificar')) {
        if (body.contra) {
            body.contra = bcrypt.hashSync(body.contra, 10);
        }
        if (body.permisos) {
            body.permisos = empaquetarPermisos(body.permisos);
        }
        Usuario.update(body, {
            where: {
                nombreUsuario: id
            }
        }).then(affected => {
            res.json({
                affected
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                err
            });
        });
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

// ===============================================
// Delete user
// ===============================================
app.delete('/users/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('u_borrar')) {
        Usuario.update({
            estado: false
        }, {
            where: {
                nombreUsuario: id
            }
        }).then(affected => {
            res.json({
                affected
            });
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                err
            });
        });
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});


// ===============================================
// Export routes
// ===============================================
module.exports = app;
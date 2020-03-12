/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/

const express = require('express');
const app = express();
const _ = require('underscore');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../middlewares/authentication');

// ===============================================
// Proyecto's models
// ===============================================
const { Proyecto } = require('../Models/Proyectos');


// ===============================================
// Create Proyecto
// ===============================================
app.post('/proyecto', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('pro_escribir')) {
        if (body.proyecto) {
            // save type to db
            Proyecto.create(body).then(proyectoDB => {
                res.json({
                    proyecto: proyectoDB
                });
            }).catch(err => {
                return res.status(500).json({
                    err
                });
            });
        } else {
            res.status(400).json({
                err: {
                    message: 'El nombre del proyecto es necesario'
                }
            });
        }
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

// ===============================================
// Get Proyecto by id
// ===============================================
app.get('/proyecto/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        Proyecto.findByPk(id)
            .then(proyectoDB => {
                if (!proyectoDB) {
                    return res.status(404).json({
                        err: {
                            message: 'Proyecto no encontrado'
                        }
                    });
                }
                res.json({
                    proyecto: proyectoDB
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
// Get a paginated list of Proyectos
// default from 0 to 15
// ===============================================
app.get('/proyecto', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        Proyecto.count({})
            .then(count => {
                Proyecto.findAll({
                    offset: from,
                    limit
                }).then(proyectosDB => {
                    res.json({
                        proyectos: proyectosDB,
                        count
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
});

// ===============================================
// update Proyecto
// ===============================================
app.put('/proyecto/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['proyecto', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_modificar')) {
        if (body.proyecto || body.estado != undefined) {
            Proyecto.update(body, {
                where: {
                    id
                }
            }).then(affected => {
                res.json({
                    affected
                });
            }).catch(err => {
                res.status(500).json({
                    err
                });
            });
        } else {
            res.status(400).json({
                err: {
                    message: 'No hay nada que modificar'
                }
            });
        }
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

// ===============================================
// Delete proyecto
// ===============================================
app.delete('/proyecto/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_borrar')) {
        Proyecto.update({
            estado: false
        }, {
            where: {
                id
            }
        }).then(affected => {
            res.json({
                affected
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
});


module.exports = app;
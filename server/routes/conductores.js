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
// Conductores' related Models
// ===============================================
const { Conductor } = require('../Models/Conductores');
const { Personal } = require('../Models/Personal');
const { Vehiculo, CodigoTipoDeVehiculo, TipoDeVehiculo } = require('../Models/Vehicle');


app.post('/conductor', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('p_escribir') && user.permisos.includes('ve_leer') && user.permisos.includes('p_leer')) {
        if (body.personal && body.movil) {
            Conductor.create(body)
                .then(conductorDB => {
                    res.json({
                        conductor: conductorDB
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                })
        } else {
            res.status(400).json({
                err: {
                    message: 'El conductor y el vehículo asignado son necesarios'
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

app.get('/conductor', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('ve_leer') && user.permisos.includes('p_leer')) {
        Conductor.findAndCountAll({
            offset: from,
            limit,
            where,
            include: [{
                model: Vehiculo,
                include: [{
                    model: CodigoTipoDeVehiculo,
                    include: [{
                        model: TipoDeVehiculo
                    }]
                }]
            }, {
                model: Personal
            }]
        }).then((reply) => {
            res.json({
                conductores: reply.rows,
                count: reply.count
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

app.get('/conductor/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;

    if (user.permisos.includes('ve_leer') && user.permisos.includes('p_leer')) {
        Conductor.findByPk(id)
            .then(conductor => {
                if (!conductor) {
                    return res.status(404).json({
                        err: {
                            message: 'No encontrado'
                        }
                    });
                }
                res.json({
                    conductor
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

app.put('/conductor/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    let body = req.body;
    if (user.permisos.includes('p_escribir') && user.permisos.includes('ve_leer') && user.permisos.includes('p_leer')) {
        Conductor.update(body, {
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

app.delete('/conductor/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_escribir') && user.permisos.includes('ve_leer') && user.permisos.includes('p_leer')) {
        Conductor.update({
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
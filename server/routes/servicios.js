/**
 *
 * @title:             Servicios API
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code will handle 'servicios' related requests
 *
 **/

const express = require('express');
const app = express();
const _ = require('underscore');

// ===============================================
// Servicios' related Models
// ===============================================
const { Servicio, VehiculosServicios } = require('../Models/Servicios');
const { Vehiculo } = require('../Models/Vehicle');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../middlewares/authentication');

// ===============================================
// Create servicio
// ===============================================
app.post('/servicios', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('pro_escribir')) {
        if (body.servicio) {
            Servicio.create(body)
                .then(servicioDB => {
                    res.json({
                        servicio: servicioDB
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                });
        } else {
            res.status(400).json({
                err: {
                    message: 'El servicio es necesario'
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
// Get servicio by id
// ===============================================
app.get('/servicios/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        Servicio.findByPk(id)
            .then(servicioDB => {
                if (!servicioDB) {
                    return res.status(404).json({
                        err: {
                            message: 'No encontrado'
                        }
                    });
                }
                res.json({
                    servicio: servicioDB
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
// Get a paginated list of servicios
// default from 0 to 15
// ===============================================
app.get('/servicios', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status) == 1 ? true : false;
        where.estado = status
    }
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        Servicio.findAndCountAll({
            offset,
            limit,
            where
        }).then(reply => {
            res.json({
                servicios: reply.rows,
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

// ===============================================
// Update servicio
// ===============================================
app.put('/servicios/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    let body = req.body;
    if (user.permisos.includes('pro_modificar')) {
        Servicio.update(body, {
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

// ===============================================
// Delete servicio
// ===============================================
app.delete('/servicios/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_borrar')) {
        Servicio.update({
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

// ===============================================
// link vehiculo servicios
// ===============================================
app.post('/vehiculo_servicio', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('pro_escribir')) {
        if (body.movil && body.servicio) {
            VehiculosServicios.create(body)
                .then(vehiculoServicio => {
                    res.json({
                        vehiculoServicio
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                });
        } else {
            res.status(400).json({
                err: {
                    message: 'El vehiculo y el servicio son necesarios'
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
// get vehiculos and servicios links by id
// ===============================================
app.get('/vehiculo_servicio/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        VehiculosServicios.findByPk(id, {
            include: [{
                    model: Servicio
                },
                {
                    model: Vehiculo
                }
            ]
        }).then(vehiculoServicio => {
            if (!vehiculoServicio) {
                return res.status(404).json({
                    err: {
                        message: 'No encontrado'
                    }
                });
            }
            res.json({
                vehiculoServicio
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
// Get a paginated list of links between vehiculos and servicios
// default from 0 to 15
// ===============================================
app.get('/vehiculo_servicio', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status) == 1 ? true : false;
        where.estado = status
    }
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        VehiculosServicios.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                    model: Servicio
                },
                {
                    model: Vehiculo
                }
            ]
        }).then(reply => {
            res.json({
                vehiculosServicio: reply.rows,
                count: reply.count
            });
        }).catch(err => {
            res.status(500).json({
                err
            });
        })
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

// ===============================================
// Update link between vehuculo and servicio
// ===============================================
app.put('/vehiculo_servicio/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('pro_modificar')) {
        VehiculosServicios.update(body, {
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

// ===============================================
// delete link between vehiculo and servicio
// ===============================================
app.delete('/vehiculo_servicio/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;

    if (user.permisos.includes('pro_borrar')) {
        VehiculosServicios.update({
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
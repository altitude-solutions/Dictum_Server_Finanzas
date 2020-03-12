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
// Rutas' related models
// ===============================================
const { Ruta, VehiculosRutas } = require('../Models/Ruta');
const { TipoDeVehiculo, Vehiculo } = require('../Models/Vehicle');
const { Servicio } = require('../Models/Servicios');


// ===============================================
// Create ruta
// ===============================================
app.post('/ruta', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('ru_escribir')) {
        if (body.ruta && body.servicio_id && body.tipoDeVehiculos) {
            Ruta.create(body)
                .then(rutaDB => {
                    res.json({
                        ruta: rutaDB
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                })
        } else {
            res.status(400).json({
                err: {
                    message: "El código de la ruta, servicio, tipo de vehículo son necesarios"
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
// get ruta by id
// ===============================================
app.get('/ruta/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ru_leer')) {
        Ruta.findByPk(id, {
            include: [{
                model: TipoDeVehiculo
            }, {
                model: Servicio
            }]
        }).then(rutaDB => {
            if (!rutaDB) {
                return res.status(404).json({
                    err: {
                        message: 'No encontrado'
                    }
                });
            }
            res.json({
                ruta: rutaDB
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
// Get rutas
// Optional pagination
// Default 15 rutas from 0
// ===============================================
app.get('/ruta', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('ru_leer')) {
        Ruta.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                model: TipoDeVehiculo
            }, {
                model: Servicio
            }]
        }).then(reply => {
            res.json({
                rutas: reply.rows,
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
// Update ruta
// ===============================================
app.put('/ruta/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['ruta', 'servicio_id', 'tipoDeVehiculos', 'referencia', 'zona', 'turno', 'frecuencia', 'descripcionServicio', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ru_modificar')) {
        Ruta.update(body, {
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
// Delete ruta
// ===============================================
app.delete('/ruta/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ru_borrar')) {
        Ruta.update({
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
// Create link ruta-vehiculo
// ===============================================
app.post('/ruta_vehiculo', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('ru_escribir')) {
        if (body.ruta_id && body.movil) {
            VehiculosRutas.create(body)
                .then(linkDB => {
                    res.json({
                        vehiculoRuta: linkDB
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                })
        } else {
            res.status(400).json({
                err: {
                    message: "La ruta y el vehículo son necesarios"
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
// get link ruta-vehiculo by id
// ===============================================
app.get('/ruta_vehiculo/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ru_leer')) {
        VehiculosRutas.findByPk(id, {
            include: [{
                model: Ruta
            }, {
                model: Vehiculo
            }]
        }).then(linkDb => {
            if (!linkDb) {
                return res.status(404).json({
                    err: {
                        message: 'No encontrado'
                    }
                });
            }
            res.json({
                vehiculoRuta: linkDb
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
// Get link ruta-vehiculo
// Optional pagination
// Default 15 rutas from 0
// ===============================================
app.get('/ruta_vehiculo', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('ru_leer')) {
        VehiculosRutas.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                model: Ruta
            }, {
                model: Vehiculo
            }]
        }).then(reply => {
            res.json({
                vehiculosRutas: reply.rows,
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
// Update link ruta-vehiculo
// ===============================================
app.put('/ruta_vehiculo/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['ruta_id', 'movil', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ru_modificar')) {
        VehiculosRutas.update(body, {
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
// Delete link ruta-vehiculo
// ===============================================
app.delete('/ruta_vehiculo/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ru_borrar')) {
        VehiculosRutas.update({
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
// Export rutas
// ===============================================
module.exports = app;
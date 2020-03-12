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
// Vehiculos' related Models
// ===============================================
const { CodigoTipoDeVehiculo, Vehiculo, TipoDeVehiculo } = require('../Models/Vehicle');
const { MotivosDePago } = require('../Models/Pagos');
const { Proyecto } = require('../Models/Proyectos');
const { Servicio, VehiculosServicios } = require('../Models/Servicios');
const { Conductor } = require('../Models/Conductores');
const { Personal } = require('../Models/Personal');
const { VehiculosRutas, Ruta } = require('../Models/Ruta');


// ===============================================
// Create TipoDeVehiculo
// ===============================================
app.post('/tipo_de_vehiculo', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('ve_escribir')) {
        if (body.tipo) {
            // save type to db
            TipoDeVehiculo.create(body).then(tipoDb => {
                res.json({
                    tipoDeVehiculo: tipoDb
                });
            }).catch(err => {
                return res.status(500).json({
                    err
                });
            });
        } else {
            res.status(400).json({
                err: {
                    message: 'El tipo de vehículo es necesario'
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
// Get tipo de vehiculo by id
// ===============================================
app.get('/tipo_de_vehiculo/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ve_leer')) {
        TipoDeVehiculo.findByPk(id)
            .then(tipoDb => {
                if (!tipoDb) {
                    return res.status(404).json({
                        err: {
                            message: 'Tipo de vehículo no encontrado'
                        }
                    });
                }
                res.json({
                    tipoDeVehiculo: tipoDb
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
// Get a paginated list of tipos de vehiculo
// default from 0 to 15
// ===============================================
app.get('/tipo_de_vehiculo', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        where.estado = Number(req.query.status) == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('ve_leer')) {
        TipoDeVehiculo.findAndCountAll({
            offset: from,
            limit,
            where
        }).then(reply => {
            res.json({
                tiposDeVehiculo: reply.rows,
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
// update tipo de vehiculo
// ===============================================
app.put('/tipo_de_vehiculo/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['tipo', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ve_modificar')) {
        // Undefined instead of delete method, interesting
        if (body.tipo || body.estado != undefined) {
            TipoDeVehiculo.update(body, {
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
// Create CodigoTipoDeVehiculo
// ===============================================
app.post('/cod_tipo', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('ve_escribir')) {
        if (body.tipo && body.codigo) {
            TipoDeVehiculo.findByPk(body.tipo)
                .then(tipo => {
                    // Check if referenced type exists
                    if (!tipo) {
                        return res.status(404).json({
                            err: {
                                message: 'Tipo de vehículo no encontrado'
                            }
                        });
                    }
                    // Save cod to db
                    CodigoTipoDeVehiculo.create(body).then(codTipoDb => {
                        res.json({
                            codTipoDeVehiculo: codTipoDb
                        });
                    }).catch(err => {
                        return res.status(500).json({
                            err
                        });
                    });
                }).catch(err => {
                    return res.status(500).json({
                        err
                    });
                });
        } else {
            res.status(400).json({
                err: {
                    message: 'El código de tipo de vehículo y el tipo de vehiculo es necesario'
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
// Get codigo tipo de vehiculo by id
// ===============================================
app.get('/cod_tipo/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ve_leer')) {
        CodigoTipoDeVehiculo.findByPk(id, {
            include: [{
                model: TipoDeVehiculo
            }]
        }).then(codTipoDb => {
            if (!codTipoDb) {
                return res.status(404).json({
                    err: {
                        message: 'Código tipo de vehículo no encontrado'
                    }
                });
            }
            res.json({
                codTipoDeVehiculo: codTipoDb
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
// Get a paginated list of tipos de vehiculo
// default from 0 to 15
// ===============================================
app.get('/cod_tipo', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        where.estado = Number(req.query.status) == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('ve_leer')) {
        CodigoTipoDeVehiculo.findAndCountAll({
            offset: from,
            limit,
            where,
            include: [{
                model: TipoDeVehiculo
            }]
        }).then(reply => {
            res.json({
                codTiposDeVehiculo: reply.rows,
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
// update codigo tipo de vehiculo
// ===============================================
app.put('/cod_tipo/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['tipo', 'codigo', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ve_modificar')) {
        if (body.tipo || body.codigo || body.estado != undefined) {
            CodigoTipoDeVehiculo.update(body, {
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
// Create vehicle
// ===============================================
app.post('/vehi', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('ve_escribir')) {
        if (body.movil && body.placa) {
            Vehiculo.create(body)
                .then(vehicleDB => {
                    res.json({
                        vehiculo: vehicleDB
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                });
        } else {
            res.status(400).json({
                err: {
                    message: "El número de móvil y la placa son necesarios"
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
// Read vehi by id
// ===============================================
app.get('/vehi/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ve_leer')) {
        Vehiculo.findByPk(id, {
            include: [{
                model: MotivosDePago
            }, {
                model: Proyecto
            }, {
                model: CodigoTipoDeVehiculo,
                include: [{
                    model: TipoDeVehiculo
                }]
            }]
        }).then(vehicleDb => {
            if (!vehicleDb) {
                return res.status(404).json({
                    err: {
                        message: 'Vehículo no encontrado'
                    }
                });
            }
            VehiculosServicios.findAll({
                where: {
                    movil: id
                },
                include: [{
                    model: Servicio
                }]
            }).then(serviciosDB => {
                let vehiAux = vehicleDb.toJSON();
                vehiAux.servicios = [];
                for (let i = 0; i < serviciosDB.length; i++) {
                    vehiAux.servicios.push(serviciosDB[i].toJSON());
                }
                Conductor.findAll({
                    where: {
                        movil: id
                    },
                    include: [{
                        model: Personal
                    }]
                }).then(conductores => {
                    vehiAux.conductores = [];
                    for (let i = 0; i < conductores.length; i++) {
                        vehiAux.conductores.push(conductores[i].toJSON());
                    }
                    VehiculosRutas.findAll({
                        where: {
                            movil: id
                        },
                        include: [{
                            model: Ruta
                        }]
                    }).then(vehiculosrutas => {
                        vehiAux.rutas = [];
                        for (let i = 0; i < vehiculosrutas.length; i++) {
                            vehiAux.rutas.push(vehiculosrutas[i].toJSON());
                        }
                        res.json({
                            vehiculo: vehiAux
                        });
                    }).catch(err => {
                        res.status(500).json({
                            err
                        });
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                });
            }).catch(err => {
                res.status(500).json({
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
});

// ===============================================
// Get vehicles
// Optional pagination
// Default 1000 users from 0
// ===============================================
app.get('/vehi', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('ve_leer')) {
        Vehiculo.findAndCountAll({
            offset: from,
            limit,
            where,
            include: [{
                model: MotivosDePago
            }, {
                model: Proyecto
            }, {
                model: CodigoTipoDeVehiculo,
                include: [{
                    model: TipoDeVehiculo
                }]
            }]
        }).then(reply => {
            res.json({
                vehiculos: reply.rows,
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
// Update vehicle
// ===============================================
app.put('/vehi/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    let body = req.body;
    if (user.permisos.includes('ve_modificar')) {
        Vehiculo.update(body, {
            where: {
                movil: id
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
// Delete user
// ===============================================
app.delete('/vehi/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('ve_borrar')) {
        Vehiculo.update({
            estado: false
        }, {
            where: {
                movil: id
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
// Create MotivosDePago
// ===============================================
app.post('/motivos_de_pago', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('pro_escribir')) {
        if (body.motivo) {
            // save reason to db
            MotivosDePago.create(body).then(motivoDB => {
                res.json({
                    motivo: motivoDB
                });
            }).catch(err => {
                return res.status(500).json({
                    err
                });
            });
        } else {
            res.status(400).json({
                err: {
                    message: 'El motivo de pago es necesario'
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
app.get('/motivos_de_pago/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        MotivosDePago.findByPk(id)
            .then(motivoDB => {
                if (!motivoDB) {
                    return res.status(404).json({
                        err: {
                            message: 'Motivo de pago no encontrado'
                        }
                    });
                }
                res.json({
                    motivo: motivoDB
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
app.get('/motivos_de_pago', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        MotivosDePago.findAndCountAll({
            offset: from,
            limit,
            where
        }).then(reply => {
            res.json({
                motivos: reply.rows,
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
// update Proyecto
// ===============================================
app.put('/motivos_de_pago/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['motivo', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_modificar')) {
        MotivosDePago.update(body, {
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
// Delete proyecto
// ===============================================
app.delete('/motivos_de_pago/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('pro_borrar')) {
        MotivosDePago.update({
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
// Export vehicles
// ===============================================
module.exports = app;
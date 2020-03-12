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
// Personnel related models
// ===============================================
const { Personal, Supervisor } = require('../Models/Personal');

// ===============================================
// Create user
// ===============================================
app.post('/personnel', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('p_escribir')) {
        if (body.idPersonal && body.nombre && body.carnet && body.cargo && body.diasLaborales) {
            Personal.create(body).then(personalDB => {
                res.json({
                    personal: personalDB
                });
            }).catch(err => {
                res.status(500).json({
                    err
                });
            });
        } else {
            res.status(400).json({
                err: {
                    message: "El ID, nombre, carnet, cargo y días laborales son necesarios"
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
// Read user by id
// ===============================================
app.get('/personnel/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_leer')) {
        Personal.findByPk(id)
            .then(personalDB => {
                if (!personalDB) {
                    return res.status(404).json({
                        err: {
                            message: 'Empleado no encontrado'
                        }
                    });
                }
                res.json({
                    personal: personalDB
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
// Get users
// Optional pagination
// Default 15 users from 0
// ===============================================
app.get('/personnel', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('p_leer')) {
        Personal.count()
            .then(count => {
                Personal.findAll({
                    offset: from,
                    limit,
                    where
                }).then(personnel => {
                    res.json({
                        personnel,
                        count
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                })
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
// Update user
// ===============================================
app.put('/personnel/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['nombre', 'carnet', 'cargo', 'turno', 'lugarDeTrabajo', 'seccion', 'superior', 'diasLaborales', 'estado', 'proyecto_id']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_modificar')) {
        Personal.update(body, {
            where: {
                idPersonal: id
            }
        }).then(affected => {
            res.json({
                affected
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
// Delete user
// ===============================================
app.delete('/personnel/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_borrar')) {
        Personal.update({
            estado: false
        }, {
            where: {
                idPersonal: id
            }
        }).then(affected => {
            res.json({
                affected
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
// Create supervisor
// ===============================================
app.post('/supervisor', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('p_escribir')) {
        if (body.supervisor && body.zona) {
            Supervisor.create(body).then(superDB => {
                res.json({
                    supervisor: superDB
                });
            }).catch(err => {
                return res.status(500).json({
                    err
                });
            });
        } else {
            res.status(400).json({
                err: {
                    message: 'El supervisor y la zona son necesarios'
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
app.get('/supervisor/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_leer')) {
        Supervisor.findByPk(id, {
            include: [{
                model: Personal
            }]
        }).then(superDB => {
            if (!superDB) {
                return res.status(404).json({
                    err: {
                        message: 'No encontrado'
                    }
                });
            }
            res.json({
                supervisor: superDB
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
app.get('/supervisor', verifyToken, (req, res) => {
    let from = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 15;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status);
        where.estado = status == 1 ? true : false;
    }
    let user = req.user;
    if (user.permisos.includes('p_leer')) {
        Supervisor.findAndCountAll({
            offset: from,
            limit,
            where,
            include: [{
                model: Personal
            }]
        }).then(reply => {
            res.json({
                supervisores: reply.rows,
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
app.put('/supervisor/:id', verifyToken, (req, res) => {
    let body = _.pick(req.body, ['supervisor', 'zona', 'descripcion', 'estado']);
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_modificar')) {
        Supervisor.update(body, {
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
app.delete('/supervisor/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('p_borrar')) {
        Supervisor.update({
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
// Export routes
// ===============================================
module.exports = app;
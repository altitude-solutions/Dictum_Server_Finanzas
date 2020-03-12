/**
 *
 * @title:             Finanzas REST API
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code will handle requests from Finanzas App for LPL
 *
 **/

// ===============================================
// Server imports
// ===============================================
const express = require('express');
const app = express();

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../middlewares/authentication');

// ===============================================
// Model imports
// ===============================================
const { EmpresaGrupo, EntidadFinanciera, TipoDeEntidad } = require('../Models/Finanzas/General');

// ===============================================
// Create Tipo Entidad
// ===============================================
app.post('/entidadFinanciera', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_escribir')) {
        EntidadFinanciera.create(body)
            .then(saved => {
                res.json({
                    entidadFinanciera: saved
                });
            })
            .catch(err => {
                if (err) {
                    return res.status(500).json({
                        err
                    });
                }
            });
        res.json({
            body
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
// Get Entidad by id
// ===============================================
app.get('/entidadFinanciera/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('fin_leer')) {
        EntidadFinanciera.findByPk(id)
            .then(entidadFinanciera => {
                if (!entidadFinanciera) {
                    return res.status(404).json({
                        err: {
                            message: 'Entidad financiera no encontrada'
                        }
                    });
                }

                res.json({
                    entidadFinanciera
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
// Get entidades financieras
// ===============================================
app.get('/entidadFinanciera', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 100;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status)
        where.estado = status
    }
    let user = req.user;
    if (user.permisos.includes('fin_leer')) {
        EntidadFinanciera.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                model: TipoDeEntidad
            }]
        }).then(reply => {
            res.json({
                entidades: reply.rows,
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
// Update entidad financiera
// ===============================================
app.put('/entidadFinanciera/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_modificar')) {
        res.json({
            id,
            body
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
// Delte entidad financiera
// ===============================================
app.delete('/entidadFinanciera/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('fin_borrar')) {
        res.json({
            id
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
// Get tipos de entidad
// ===============================================
app.get('/tipo_entidad', verifyToken, (req, res) => {
    let offset = req.query.from || 0;
    let limit = req.query.to || 100;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status)
        where.estado = status
    }
    let user = req.user;

    if (user.permisos.includes('fin_leer')) {
        TipoDeEntidad.findAndCountAll({
            offset,
            limit,
            where
        }).then(reply => {
            res.json({
                tiposDeEntidad: reply.rows,
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
// Get empresas
// ===============================================
app.get('/empresas', verifyToken, (req, res) => {
    let offset = req.query.from || 0;
    let limit = req.query.to || 100;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status)
        where.estado = status
    }
    let user = req.user;
    if (user.permisos.includes('pro_leer')) {
        EmpresaGrupo.findAndCountAll({
            offset,
            limit,
            where
        }).then(reply => {
            res.json({
                empresas: reply.rows,
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

module.exports = app;
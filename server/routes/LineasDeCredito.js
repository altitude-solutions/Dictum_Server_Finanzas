/**
 *
 * @title:             Lineas de credito REST API
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code will handle requests from "lineas de credito" tab in Finanzas App for LPL
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
const { LineasDeCredito } = require('../Models/Finanzas/LineasDeCredito');
const { EmpresaGrupo, EntidadFinanciera, TipoDeEntidad } = require('../Models/Finanzas/General');



app.post('/lineaDeCredito', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_escribir')) {
        LineasDeCredito.findAll({
            where: {
                codigo: body.codigo
            }
        }).then(lineaExistente => {
            if (!lineaExistente[0]) {
                LineasDeCredito.create(body)
                    .then(lineaDB => {
                        res.json({
                            lineaDeCredito: lineaDB
                        });
                    }).catch(err => {
                        res.status(500).json({
                            err
                        });
                    });
            } else {
                res.status(400).json({
                    err: {
                        message: 'El código de la lÍnea de crédito ya existe'
                    }
                });
            }
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
// Get Línea de crédito by id
// ===============================================
app.get('/lineaDeCredito/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('fin_leer')) {
        LineasDeCredito.findByPk(id, {
            include: [{
                model: EntidadFinanciera,
                include: [{
                    model: TipoDeEntidad
                }]
            }, {
                model: EmpresaGrupo
            }]
        }).then(lineaDB => {
            if (!lineaDB) {
                return res.status(404).json({
                    err: {
                        message: 'No encontrado'
                    }
                });
            }
            res.json({
                lineaDeCredito: lineaDB
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
// Get líneas de crédito
// ===============================================
app.get('/lineaDeCredito', verifyToken, (req, res) => {
    let offset = req.query.from || 0;
    let limit = req.query.to || 10000;
    let where = {};
    if (req.query.status) {
        let status = Number(req.query.status)
        where.estado = status
    }
    if (req.query.entidad) {
        where.entidad = Number(req.query.entidad);
    }
    if (req.query.empresa) {
        where.empresaGrupo = Number(req.query.empresa);
    }
    let user = req.user;
    if (user.permisos.includes('fin_leer')) {
        LineasDeCredito.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                model: EntidadFinanciera,
                include: [{
                    model: TipoDeEntidad
                }]
            }, {
                model: EmpresaGrupo
            }]
        }).then(reply => {
            res.json({
                lineasDeCredito: reply.rows,
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
// Update línea de crédito
// ===============================================
app.put('/lineaDeCredito/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_modificar')) {
        LineasDeCredito.update(body, {
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
// Delete línea de crédito
// ===============================================
app.delete('/lineaDeCredito/:id', verifyToken, (req, res) => {
    let id = req.params.id;
    let user = req.user;
    if (user.permisos.includes('fin_borrar')) {
        LineasDeCredito.update({
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
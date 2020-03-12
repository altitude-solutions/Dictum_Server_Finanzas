/**
 *
 * @title:             Registro de horarios
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code will handle http requests from clients using Operador de Radio App for LPL
 *
 **/


const express = require('express');
const app = express();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../middlewares/authentication');

// ===============================================
// Operador de radio related models
// ===============================================
const { RegistroDeHorarios, CicloDeHorarios, RegistroDeDatos_OR, RegistroDePenalidades, ListaDeDatos_OR } = require('../Models/OperadorDeRadio');
const { Ruta } = require('../Models/Ruta');
const { Vehiculo } = require('../Models/Vehicle');
const { Personal, Supervisor } = require('../Models/Personal');
const { Usuario } = require('../Models/User');

// ===============================================
// Get lista de datos
// ===============================================
app.get('/listaDeDatos_OR', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;
    let user = req.user;
    if (user.permisos.includes('or_leer')) {
        ListaDeDatos_OR.findAndCountAll({
            offset,
            limit
        }).then(reply => {
            res.json({
                listaDeDatos: reply.rows,
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
// Create Penalty
// ===============================================
app.post('/penalties', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('or_escribir')) {
        body.forEach(element => {
            // let keys = Object.keys(element);
            // keys.forEach(key => {
            // if (element[key] == '') {
            //     element[key] = null;
            // }
            // if (element['horaDeRecepcion'] == 14400000) {
            //     element['horaDeRecepcion'] = null;
            // }
            // if (element['horaDeRespuesta'] == 14400000) {
            //     element['horaDeRespuesta'] = null;
            // }
            // if (element['horaDeContrarespuesta'] == 14400000) {
            //     element['horaDeContrarespuesta'] = null;
            // }
            // });
            // console.log(element);
            RegistroDePenalidades.create(element)
                .then(saved => {

                }).catch(err => {
                    console.log(err);
                });
        });
        res.json({
            ok: true
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
// Get last 31 days penalties
// ===============================================
app.get('/penalties', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    // date filters
    let fromDate = Number(req.query.fromDate) || new Date().getTime();
    let toDate = Number(req.query.toDate) || new Date().getTime();

    let where = {
        horaDeRecepcion: {
            [Op.and]: {
                [Op.gte]: fromDate,
                [Op.lt]: toDate
            }
        }
    };
    let user = req.user;
    if (user.permisos.includes('or_leer')) {
        RegistroDePenalidades.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                model: Ruta
            }, {
                model: Vehiculo
            }, {
                model: Supervisor
            }, {
                model: Usuario
            }],
            order: [
                ['horaDeRecepcion', 'ASC']
            ]
        }).then(reply => {
            res.json({
                registros: reply.rows,
                count: reply.count
            })
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
// Create Registro de Horarios
// ===============================================
app.post('/registroDeHorarios', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('or_escribir')) {
        for (let i = 0; i < body.length; i++) {
            let registro = body[i];
            let horarios = body[i].horarios;
            delete registro.horarios;
            // let registroKeys = Object.keys(registro);
            // registroKeys.forEach(key => {
            //     if (registro[key] == '') {
            //         registro[key] = null;
            //     }
            // });
            RegistroDeHorarios.create(registro)
                .then(registroDB => {
                    for (let j = 0; j < horarios.length; j++) {
                        let element = horarios[j];
                        // let keys = Object.keys(element);
                        // for (let k = 0; k < keys.length; k++) {
                        //     if (element[keys[k]] == 14400000 || element[keys[k]] == '')
                        //         element[keys[k]] = null;
                        // }
                        element.parent = registroDB.toJSON().id;
                        CicloDeHorarios.create(element)
                            .then(cicloDB => {
                                //console.log(cicloDB);
                            }).catch(err => {
                                console.log(err);
                            });
                    }
                }).catch(err => {
                    console.log(err);
                });
        }
        res.json({
            ok: true
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
// Get last 31 days of Regitro de hoarios
// ===============================================
app.get('/registroDeHorarios', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    // date filters
    let fromDate = Number(req.query.fromDate) || new Date().getTime();
    let toDate = Number(req.query.toDate) || new Date().getTime();

    let where = {
        salidaBase: {
            [Op.and]: {
                [Op.gte]: fromDate,
                [Op.lt]: toDate
            }
        }
    };
    let user = req.user;
    if (user.permisos.includes('or_leer')) {
        CicloDeHorarios.findAndCountAll({
            offset,
            limit,
            where,
            include: [{
                model: RegistroDeHorarios,
                include: [{
                    model: Vehiculo
                }, {
                    model: Usuario
                }, {
                    model: Personal
                }, {
                    model: Ruta
                }]
            }],
            order: [
                ['parent', 'ASC'],
                ['salidaBase', 'ASC']
            ]
        }).then(reply => {
            res.json({
                registros: reply.rows,
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
// Create registro de datos
// ===============================================
app.post('/registroDeDatos', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('or_escribir')) {
        body.forEach(element => {
            // let keys = Object.keys(element);
            // keys.forEach(key => {
            //     if (element[key] == '') {
            //         element[key] = null;
            //     }
            //     if (element['horaDeRecepcion'] == 14400000) {
            //         element['horaDeRecepcion'] = null;
            //     }
            //     if (element['horaComunicacion'] == 14400000) {
            //         element['horaComunicacion'] = null;
            //     }
            //     if (element['horaEjecucion'] == 14400000) {
            //         element['horaEjecucion'] = null;
            //     }
            //     if (element['horaVerificacion'] == 14400000) {
            //         element['horaVerificacion'] = null;
            //     }
            //     if (element['horaConciliacion'] == 14400000) {
            //         element['horaConciliacion'] = null;
            //     }
            // });
            RegistroDeDatos_OR.create(element)
                .then(saved => {

                }).catch(err => {
                    console.log(err);
                });
        });
        res.json({
            ok: true
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
// Get last 31 days of registro de datos
// ===============================================
app.get('/registroDeDatos', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    // date filters
    let fromDate = Number(req.query.fromDate) || new Date().getTime();
    let toDate = Number(req.query.toDate) || new Date().getTime();

    let where = {
        horaDeRecepcion: {
            [Op.and]: {
                [Op.gte]: fromDate,
                [Op.lt]: toDate
            }
        }
    };

    let user = req.user;
    if (user.permisos.includes('or_leer')) {
        RegistroDeDatos_OR.findAndCountAll({
            offset,
            limit,
            where,
            include: {
                all: true
            },
            order: [
                ['horaDeRecepcion', 'ASC']
            ]
        }).then(reply => {
            res.json({
                registros: reply.rows,
                count: reply.count
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


module.exports = app;
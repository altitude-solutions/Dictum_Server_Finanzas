/**
 *
 * @title:             PLanes de Pagos
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       This code will handle request related to Planes de Pagos and Cuotas
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
// Plan de Pagos related models
// ===============================================
const { EntidadFinanciera, TipoDeEntidad, EmpresaGrupo } = require('../Models/Finanzas/General');
const { LineasDeCredito } = require('../Models/Finanzas/LineasDeCredito');
const { PlanDePagos, CuotaPlanDePagos, CuotaEfectiva } = require('../Models/Finanzas/PlanDePagos');

app.post('/planDePagos', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_escribir')) {
        if (body.numeroDeContratoOperacion && body.monto && body.fechaFirma && body.moneda && body.plazo && body.frecuenciaDePagos && body.empresaGrupo && body.entidadFinanciera) {
            if (body.lineaDeCredito) {
                LineasDeCredito.findByPk(body.lineaDeCredito)
                    .then(lineaDB => {
                        PlanDePagos.findAll({
                            where: {
                                lineaDeCredito: body.lineaDeCredito,
                                estado: true
                            }
                        })
                            .then(operaciones => {
                                let lineaDeCredito_creditLimit = lineaDB.toJSON().monto;
                                operaciones.forEach(element => {
                                    let op_aux = element.toJSON();
                                    lineaDeCredito_creditLimit -= op_aux.monto;
                                });
                                if (lineaDeCredito_creditLimit >= body.monto) {
                                    if (lineaDB.fechaVencimiento >= body.fechaVencimiento) {
                                        if(body.fechaFirma >= lineaDB.fechaFirma) {
                                            PlanDePagos.create(body)
                                                .then(saved => {
                                                    res.json({
                                                        planDePagos: saved
                                                    });
                                                }).catch(err => {
                                                    res.status(500).json({
                                                        err
                                                    });
                                                });
                                        }else{
                                            return res.status(400).json({
                                                err: {
                                                    message: `La fecha de firma de la operación es anterior que la fecha de creación de la línea de crédito\nFecha de firma: ${new Date(lineaDB.fechaFirma).getDate()}/${new Date(lineaDB.fechaFirma).getMonth() + 1}/${new Date(lineaDB.fechaFirma).getFullYear()}`
                                                }
                                            });
                                        }
                                    } else {
                                        return res.status(400).json({
                                            err: {
                                                message: `La fecha de vencimiento de la línea de crédito es anterior que la finalización operación\nFecha de vencimiento: ${new Date(lineaDB.fechaVencimiento).getDate()}/${new Date(lineaDB.fechaVencimiento).getMonth() + 1}/${new Date(lineaDB.fechaVencimiento).getFullYear()}`
                                            }
                                        });
                                    }
                                } else {
                                    return res.status(400).json({
                                        err: {
                                            message: `El saldo de la línea de crédito es insuficiente para sustentar esta operación\nSaldo: ${lineaDeCredito_creditLimit} ${lineaDB.moneda}`
                                        }
                                    });
                                }
                            }).catch(err => {
                                return res.status(500).json({
                                    err
                                });
                            });
                    })
                    .catch(err => {
                        return res.status(500).json({
                            err
                        });
                    });
            } else {
                PlanDePagos.create(body)
                    .then(saved => {
                        res.json({
                            planDePagos: saved
                        });
                    }).catch(err => {
                        res.status(500).json({
                            err
                        });
                    });
            }
        } else {
            if (!body.numeroDeContratoOperacion) {
                res.status(400).json({
                    err: {
                        message: 'El número de contrato u operación es necesario'
                    }
                });
            } else {
                res.status(400).json({
                    err: {
                        message: 'El número de contrato u operación, el monto, la moneda, la fecha de firma, el plazo, la frecuencia de pagos, la entidad financiera y la empresa son necesarios'
                    }
                });
            }
        }
    } else {
        res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

app.get('/planDePagos', verifyToken, (req, res) => {
    let user = req.user;

    let whereGlobal = {};
    let whereEntidades = {};
    let whereEmpresas = {};
    if (req.query.status != undefined) {
        whereGlobal.estado = Number(req.query.status) == 1 ? true : false;
    }
    if (req.query.q != undefined) {
        whereGlobal.numeroDeContratoOperacion = {
            [Op.regexp]: req.query.q
        };
        // whereGlobal.tipoOperacion = {
        //     [Op.regexp]: req.query.q
        // };
        // whereEntidades.nombreEntidad = {
        //     [Op.regexp]: req.query.q
        // };
        // whereEmpresas.empresa = {
        //     [Op.regexp]: req.query.q
        // };
    }

    if (user.permisos.includes('fin_leer')) {
        PlanDePagos.findAll({
            where: whereGlobal,
            include: [{
                model: LineasDeCredito,
                required: false
            }, {
                model: EmpresaGrupo,
                where: whereEmpresas,
                required: true
            }, {
                model: EntidadFinanciera,
                where: whereEntidades,
                required: true
            }]
        })
            .then(planesDePago => {
                res.json({
                    planesDePago
                });
            })
            .catch(err => {
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


app.get('/planDePagos/:id', verifyToken, (req, res) => {
    let user = req.user;
    let id = Number(req.params.id);

    if (user.permisos.includes('fin_leer')) {
        PlanDePagos.findByPk(id, {
            include: [{
                model: LineasDeCredito,
                required: false
            }, {
                model: EmpresaGrupo,
                required: true
            }, {
                model: EntidadFinanciera,
                required: true,
                include: [{
                    model: TipoDeEntidad,
                    required: true
                }]
            }]
        })
            .then(planDePagos => {
                if (!planDePagos) {
                    return res.status(404).json({
                        err: {
                            message: 'Plan de pagos no encontrado'
                        }
                    });
                }
                planDePagos = planDePagos.toJSON();
                CuotaPlanDePagos.findAll({
                    where: {
                        parent: planDePagos.id,
                        estado: true
                    }
                })
                    .then(cuotasDB => {
                        let cuotas = [];
                        cuotasDB.forEach(element => {
                            cuotas.push(element.toJSON());
                        });
                        planDePagos.cuotasPlan = cuotas;

                        CuotaEfectiva.findAll({
                            where: {
                                parent: planDePagos.id,
                                estado: true
                            }
                        })
                            .then(cuotasEfecDB => {
                                let cuotas_efe = [];
                                cuotasEfecDB.forEach(element => {
                                    cuotas_efe.push(element.toJSON());
                                });
                                planDePagos.cuotasEfectivas = cuotas_efe;

                                res.json({
                                    planDePagos
                                });
                            })
                            .catch(err => {
                                return res.status(500).json({
                                    err
                                });
                            });
                    })
                    .catch(err => {
                        return res.status(500).json({
                            err
                        });
                    });
            })
            .catch(err => {
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


app.delete('/planDePagos/:id', verifyToken, (req, res) => {
    let user = req.user;
    let id = Number(req.params.id);

    if (user.permisos.includes('fin_leer')) {
        PlanDePagos.update({
            estado: false
        }, {
            where: {
                id
            }
        })
        .then(opsDeleted => {
            CuotaPlanDePagos.update({
                estado: false
            },{
                where:{
                    parent:id
                }
            })
            .then(duesDeleted => {
                return res.json({
                    opsDeleted,
                    duesDeleted
                });
            })
            .catch(err => {
                return res.status(500).json({
                    err
                });
            });
        })
        .catch(err => {
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


app.post('/cuotaPlanDePagos', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_escribir')) {
        if (body.numeroDeCuota && body.fechaDePago && body.montoTotalDelPago && body.parent) {
            CuotaPlanDePagos.findAll({
                where: {
                    parent: Number(body.parent),
                    estado: true
                }
            })
                .then(thisPlanCuotas => {
                    let thisPlanCuotas_Spend = 0;

                    thisPlanCuotas.forEach(element => {
                        thisPlanCuotas_Spend += element.toJSON().pagoDeCapital;
                    });

                    PlanDePagos.findByPk(body.parent)
                        .then(thisParent => {
                            let diff = thisParent.toJSON().monto - thisPlanCuotas_Spend;
                            if(body.pagoDeCapital <= diff) {
                                CuotaPlanDePagos.create(body)
                                    .then(saved => {
                                        res.json({
                                            cuotaPlanDePagos: saved
                                        });
                                    }).catch(err => {
                                        res.status(500).json({
                                            err
                                        });
                                    });
                            }else{
                                res.status(400).json({
                                    err: {
                                        message: `El pago de capital no puede superar el saldo de la operación\nSaldo: ${diff} ${thisParent.moneda}`
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            res.status(500).json({
                                err
                            });
                        });
                })
                .catch(err => {
                    res.status(500).json({
                        err
                    });
                });
        } else {
            res.status(400).json({
                err: {
                    message: 'El plan de pagos asociado, el número de cuota, la fecha del pago y el monto son necesarios'
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


app.post('/cuotaEfectiva', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('fin_escribir')) {
        if (body.numeroDeCuota && body.fechaDePago && body.montoTotalDelPago && body.parent) {
            CuotaEfectiva.create(body)
                .then(saved => {
                    res.json({
                        cuotaEfectiva: saved
                    });
                }).catch(err => {
                    res.status(500).json({
                        err
                    });
                });
        } else {
            res.status(400).json({
                err: {
                    message: 'El plan de pagos asociado, el número de cuota, la fecha del pago y el monto son necesarios'
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

app.put('/cuotaEfectiva/:id', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    let id = Number(req.params.id);

    if (user.permisos.includes('fin_modificar')) {
        if (body.numeroDeCuota && body.fechaDePago && body.montoTotalDelPago && body.parent) {
            CuotaEfectiva.update(body, {
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
                    message: 'El plan de pagos asociado, el número de cuota, la fecha del pago y el monto son necesarios'
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

app.delete('/cuotaEfectiva/:id', verifyToken, (req, res) => {
    let user = req.user;
    let id = Number(req.params.id);

    if (user.permisos.includes('fin_borrar')) {
        CuotaEfectiva.update({
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
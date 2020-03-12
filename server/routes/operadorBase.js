/**
 *
 * @title:             Operador de Base
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Operador de Base REST API LPL
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
const { OperadorBase } = require('../Models/OperadorBase');

app.post('/operadorBase', verifyToken, (req, res) => {
    let body = req.body;
    let user = req.user;
    if (user.permisos.includes('io_escribir')) {

        // OperadorBase.bulkCreate(body)
        //     .then(saved => {
        //         res.json({
        //             registros: saved
        //         });
        //     }).catch(err => {
        //         console.log(err);
        //     });

        body.forEach(element => {
            let keys = Object.keys(element);
            keys.forEach(key => {
                if (element[key] == '') {
                    element[key] = null;
                }
            });

            OperadorBase.create(element)
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


app.get('/operadorBase', verifyToken, (req, res) => {
    let offset = Number(req.query.from) || 0;
    let limit = Number(req.query.to) || 1000;

    let  fromDate =  Number(req.query.fromDate)  || new Date().getTime();
    let toDate =  Number(req.query.toDate)  || new Date().getTime();

    let where = {
        fecha: {
            [Op.and]: {
                [Op.gte]: fromDate,
                [Op.lt]:  toDate
            }
        }
    };

    let user = req.user;
    if (user.permisos.includes('io_leer')) {
        OperadorBase.findAndCountAll({
            offset,
            limit,
            where,
            include: {
                all: true
            },
            order: [
                ['fecha', 'ASC']
            ]
        }).then(reply => {
            res.json({
                registros: reply.rows,
                count: reply.count
            });
        }).catch(err=> {
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
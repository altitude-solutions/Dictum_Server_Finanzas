/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/

const express = require('express');
const app = express();
const Excel = require('excel4node');
const Sequelize = require('sequelize');
const Op = Sequelize.Op

// Offset zona horaria -4 horas  4*3600*1000=14 400 000
timezoneOffset = - 14400000;

// ===============================================
// Middlewares
// ===============================================
const { verifyTokenByURL } = require('../middlewares/authentication');

// ===============================================
// Main models
// ===============================================
const { OperadorBase } = require('../Models/OperadorBase');
const { RegistroDeDatos_OR, RegistroDeHorarios, RegistroDePenalidades, CicloDeHorarios } = require('../Models/OperadorDeRadio');
const { VentaDeCombustible } = require('../Models/VentaDeCombustibles');

// ===============================================
// Auxiliar models
// ===============================================
const { Vehiculo, CodigoTipoDeVehiculo, TipoDeVehiculo } = require('../Models/Vehicle');
const { Personal, Supervisor } = require('../Models/Personal');
const { Ruta } = require('../Models/Ruta');
const { Usuario } = require('../Models/User');
const { MotivosDePago } = require('../Models/Pagos');

/**
 * This function generates an excel file tobe attached to response object and send back to the user
 * 
 * @param {Request} req Request Object with headers, body and user
 * @param {Response} res Response Object tobe returned with new data
 */
function generateEstacionServicio(req, res) {
    let initialDate = Number(req.query.fromDate) || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours() - 24, new Date().getMinutes(), 0, 0).getTime();
    let finalDate = Number(req.query.toDate)  || new Date().getTime();

    let where = {
        fechaYHora: {
            [Op.and]: {
                [Op.gte]: initialDate,
                [Op.lt]: finalDate
            }
        }
    };
    // Query the data
    VentaDeCombustible.findAndCountAll({
        where,
        order: [
            ['fechaYHora', 'ASC']
        ],
        include: [{
            model: Vehiculo,
            include: [{
                model:MotivosDePago
            }, {
                model: CodigoTipoDeVehiculo,
                include: [{
                    model: TipoDeVehiculo
                }]
            }]
        }, {
            model:  Usuario
            }]
    }).then(reply => {
        let wb = new Excel.Workbook();

        // Add Worksheets to the workbook
        let global_ws = wb.addWorksheet('Global');
        // let bassam_ws = wb.addWorksheet('Bassam');
        // let tk_ws = wb.addWorksheet('TK');

        let style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0'
        });

        global_ws.column(1).setWidth(15);
        global_ws.column(2).setWidth(15);
        global_ws.column(3).setWidth(15);
        global_ws.column(4).setWidth(15);
        global_ws.column(5).setWidth(15);
        global_ws.column(6).setWidth(15);
        global_ws.column(7).setWidth(60);
        global_ws.column(8).setWidth(40);

        let tableHeaders = [
            'Fecha y Hora',
            'Móvil',
            'Kilometraje (Km)',
            'Producto',
            'Volumen (L)',
            'Precio total (Bs)',
            'Comentarios',
            'Lugar de registro'
        ]

        for (let col = 0; col < tableHeaders.length; col++) {
            const header = tableHeaders[col];
            global_ws.cell(1, 1 + col)
                .string(header)
                .style(style);
        }

        for (let row = 0; row < reply.rows.length; row++) {
            const element = reply.rows[row];
            let data = element.toJSON();
            if (data.fechaYHora) {
                global_ws.cell( row + 2, 1)
                    .date(new Date(data.fechaYHora + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 1)
                    .string('');
            }
            if (data.vehiculo) {
                global_ws.cell( row + 2, 2)
                    .string(data.vehiculo.movil)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 2)
                    .string('-')
                    .style(style);
            }
            if (data.kilometraje) {
                global_ws.cell( row + 2, 3)
                    .number(data.kilometraje)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 3)
                    .number(0)
                    .style(style);
            }
            if (data.producto) {
                global_ws.cell( row + 2, 4)
                    .string(data.producto)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 4)
                    .string('-')
                    .style(style);
            }
            if (data.litros) {
                global_ws.cell( row + 2, 5)
                    .number(data.litros)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 5)
                    .number(0)
                    .style(style);
            }
            if (data.precioTotal) {
                global_ws.cell( row + 2, 6)
                    .number(data.precioTotal)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 6)
                    .number(0)
                    .style(style);
            }
            if (data.comentarios) {
                global_ws.cell( row + 2, 7)
                    .string(data.comentarios)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 7)
                    .string('')
                    .style(style);
            }
            if (data.usuario) {
                global_ws.cell( row + 2, 8)
                    .string(data.usuario.nombreReal)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 8)
                    .string('')
                    .style(style);
            }
        }
        let monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril' ,'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let aux1 = new  Date(initialDate).getMonth();
        let aux2 = new  Date(finalDate).getMonth();
        return wb.write(`${monthsList[aux1]} a ${monthsList[aux2]}-Estacion de servicio.xlsx`, res);
    }).catch(err => {
        return res.status(500).json({
            err
        });
    });
}

/**
 * Generates an excel file with Operador de Base data
 * @param {Request} req Request Object containing request data
 * @param {Response} res Response Object
 */
function generateOperadorBase(req, res) {
    let initialDate = Number(req.query.fromDate) || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours() - 24, new Date().getMinutes(), 0, 0).getTime();
    let finalDate = Number(req.query.toDate)  || new Date().getTime();

    let where = {
        fecha: {
            [Op.and]: {
                [Op.gte]: initialDate,
                [Op.lt]: finalDate
            }
        }
    };
    // Query the data
    OperadorBase.findAndCountAll({
        where,
        include: {
            all: true
        },
        order: [
            ['fecha', 'ASC']
        ]
    }).then(reply => {
        let wb = new Excel.Workbook();

        // Add Worksheets to the workbook
        let global_ws = wb.addWorksheet('Global');
        // let bassam_ws = wb.addWorksheet('Bassam');
        // let tk_ws = wb.addWorksheet('TK');

        let style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0'
        });

        global_ws.column(1).setWidth(15);
        global_ws.column(2).setWidth(15);
        global_ws.column(3).setWidth(22);
        global_ws.column(4).setWidth(22);
        global_ws.column(5).setWidth(15);
        global_ws.column(6).setWidth(30);
        global_ws.column(7).setWidth(30);
        global_ws.column(8).setWidth(30);
        global_ws.column(9).setWidth(30);
        global_ws.column(10).setWidth(40);
        global_ws.column(11).setWidth(30);

        let tableHeaders = [
            'Fecha y Hora',
            'Móvil',
            'Kilometraje de Entrada (Km)',
            'Kilometraje de Salida (Km)',
            'Ruta',
            'Conductor',
            'Ayudante 1',
            'Ayudante 2',
            'Ayudante 3',
            'Comentarios',
            'Usuario'
        ]

        for (let col = 0; col < tableHeaders.length; col++) {
            const header = tableHeaders[col];
            global_ws.cell(1, 1 + col)
                .string(header)
                .style(style);
        }

        for (let row = 0; row < reply.rows.length; row++) {
            const element = reply.rows[row];
            let data = element.toJSON();
            if (data.fecha) {
                global_ws.cell( row + 2, 1)
                    .date(new Date(data.fecha + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 1)
                    .string('');
            }
            if (data.vehiculo) {
                global_ws.cell( row + 2, 2)
                    .string(data.vehiculo.movil)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 2)
                    .string('-')
                    .style(style);
            }
            if (data.kilometrajeEntrada) {
                global_ws.cell( row + 2, 3)
                    .number(data.kilometrajeEntrada)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 3)
                    .number(0)
                    .style(style);
            }
            if (data.kilometrajeSalida) {
                global_ws.cell( row + 2, 4)
                    .number(data.kilometrajeSalida)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 4)
                    .number(0)
                    .style(style);
            }
            if (data.ruta) {
                global_ws.cell( row + 2, 5)
                    .string(data.ruta.ruta)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 5)
                    .string('-')
                    .style(style);
            }
            if (data.conductor_id) {
                global_ws.cell( row + 2, 6)
                    .string(data.conductor_id.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 6)
                    .string('')
                    .style(style);
            }
            if (data.ayudante_1_id) {
                global_ws.cell( row + 2, 7)
                    .string(data.ayudante_1_id.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 7)
                    .string('')
                    .style(style);
            }
            if (data.ayudante_2_id) {
                global_ws.cell( row + 2, 8)
                    .string(data.ayudante_2_id.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 8)
                    .string('')
                    .style(style);
            }
            if (data.ayudante_3_id) {
                global_ws.cell( row + 2, 9)
                    .string(data.ayudante_3_id.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 9)
                    .string('')
                    .style(style);
            }
            if (data.comentarios) {
                global_ws.cell( row + 2, 10)
                    .string(data.comentarios)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 10)
                    .string('')
                    .style(style);
            }
            if (data.usuario) {
                global_ws.cell( row + 2, 11)
                    .string(data.usuario.nombreReal)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 11)
                    .string('')
                    .style(style);
            }
        }
        let monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril' ,'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let aux1 = new  Date(initialDate).getMonth();
        let aux2 = new  Date(finalDate).getMonth();
        return wb.write(`${monthsList[aux1]} a ${monthsList[aux2]}-Operador de Base.xlsx`, res);
    }).catch(err => {
        return res.status(500).json({
            err
        });
    });
}


/**
 * Generates an excel file with Operador de Base data
 * @param {Request} req Request Object containing request data
 * @param {Response} res Response Object
 */
function generateRegistroDeDatos(req, res) {
    let initialDate = Number(req.query.fromDate) || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours() - 24, new Date().getMinutes(), 0, 0).getTime();
    let finalDate = Number(req.query.toDate)  || new Date().getTime();

    let where = {
        horaDeRecepcion: {
            [Op.and]: {
                [Op.gte]: initialDate,
                [Op.lt]: finalDate
            }
        }
    };
    // Query the data
    RegistroDeDatos_OR.findAndCountAll({
        where,
        include: {
            all: true
        },
        order: [
            ['horaDeRecepcion', 'ASC']
        ]
    }).then(reply => {
        let wb = new Excel.Workbook();

        // Add Worksheets to the workbook
        let global_ws = wb.addWorksheet('Global');
        // let bassam_ws = wb.addWorksheet('Bassam');
        // let tk_ws = wb.addWorksheet('TK');

        let style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0'
        });

        global_ws.column(1).setWidth(8);
        global_ws.column(2).setWidth(10);
        global_ws.column(3).setWidth(15);
        global_ws.column(4).setWidth(22);
        global_ws.column(5).setWidth(15);
        global_ws.column(6).setWidth(30);
        global_ws.column(7).setWidth(30);
        global_ws.column(8).setWidth(30);
        global_ws.column(9).setWidth(30);
        global_ws.column(10).setWidth(40);
        global_ws.column(11).setWidth(30);
        global_ws.column(12).setWidth(30);
        global_ws.column(13).setWidth(30);
        global_ws.column(14).setWidth(30);
        global_ws.column(15).setWidth(30);
        global_ws.column(16).setWidth(30);
        global_ws.column(17).setWidth(30);
        global_ws.column(18).setWidth(30);
        global_ws.column(19).setWidth(30);
        global_ws.column(20).setWidth(30);
        global_ws.column(21).setWidth(30);

        let tableHeaders = [
            'ID Diario',
            'Dato',
            'Sigma de recepción',
            'Zona',
            'Dirección',
            'Cantidad de Poda',
            'Tipo de Contenedor',
            'Código de Contenedor',
            'Mantenimiento',
            'Detalle',
            'Comentarios',
            'Hora de recepción',
            'Responsable de Comunicación',
            'Hora de Comunicación',
            'Responsable de ejecución',
            'Hora de ejecución',
            'Supervisor',
            'Hora de Verificación',
            'Sigma de Conciliación',
            'Hora de Conciliación',
            'Usuario'
        ]

        for (let col = 0; col < tableHeaders.length; col++) {
            const header = tableHeaders[col];
            global_ws.cell(1, 1 + col)
                .string(header)
                .style(style);
        }

        for (let row = 0; row < reply.rows.length; row++) {
            const element = reply.rows[row];
            let data = element.toJSON();
            if (data.idDiario) {
                global_ws.cell( row + 2, 1)
                    .string(data.idDiario);
            } else {
                global_ws.cell( row + 2, 1)
                    .string('');
            }
            if (data.lista_de_datos_or) {
                global_ws.cell( row + 2, 2)
                    .string(data.lista_de_datos_or.dato)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 2)
                    .string('')
                    .style(style);
            }
            if (data.sigmaDeRecepcion) {
                global_ws.cell( row + 2, 3)
                    .string(data.sigmaDeRecepcion)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 3)
                    .string('')
                    .style(style);
            }
            if (data.zona) {
                global_ws.cell( row + 2, 4)
                    .string(data.zona)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 4)
                    .string('-')
                    .style(style);
            }
            if (data.direccion) {
                global_ws.cell( row + 2, 5)
                    .string(data.direccion)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 5)
                    .string('-')
                    .style(style);
            }
            if (data.cantidadPoda) {
                global_ws.cell( row + 2, 6)
                    .string(data.cantidadPoda)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 6)
                    .string('0')
                    .style(style);
            }
            if (data.tipoDeContenedor) {
                global_ws.cell( row + 2, 7)
                    .string(data.tipoDeContenedor)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 7)
                    .string('')
                    .style(style);
            }
            if (data.codigoDeContenedor) {
                global_ws.cell( row + 2, 8)
                    .string(data.codigoDeContenedor)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 8)
                    .string('')
                    .style(style);
            }
            if (data.Mantenimiento) {
                global_ws.cell( row + 2, 9)
                    .string(data.Mantenimiento)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 9)
                    .string('')
                    .style(style);
            }
            if (data.detalle) {
                global_ws.cell( row + 2, 10)
                    .string(data.detalle)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 10)
                    .string('')
                    .style(style);
            }
            if (data.comentarios) {
                global_ws.cell( row + 2, 11)
                    .string(data.comentarios)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 11)
                    .string('')
                    .style(style);
            }
            if (data.horaDeRecepcion) {
                global_ws.cell( row + 2, 12)
                    .date(new Date(data.horaDeRecepcion + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 12)
                    .string('');
            }
            if (data.resCom) {
                global_ws.cell( row + 2, 13)
                    .string(data.resCom.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 13)
                    .string('')
                    .style(style);
            }
            if (data.horaComunicacion) {
                global_ws.cell( row + 2, 14)
                    .date(new Date(data.horaComunicacion + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 14)
                    .string('');
            }
            if (data.resEje) {
                global_ws.cell( row + 2, 15)
                    .string(data.resEje.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 15)
                    .string('')
                    .style(style);
            }
            if (data.horaEjecucion) {
                global_ws.cell( row + 2, 16)
                    .date(new Date(data.horaEjecucion + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 16)
                    .string('');
            }
            if (data.supervisore) {
                global_ws.cell( row + 2, 17)
                    .string(data.supervisore.zona)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 17)
                    .string('')
                    .style(style);
            }
            if (data.horaVerificacion) {
                global_ws.cell( row + 2, 18)
                    .date(new Date(data.horaVerificacion + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 18)
                    .string('');
            }
            if (data.sigmaDeConciliacion) {
                global_ws.cell( row + 2, 19)
                    .string(data.sigmaDeConciliacion)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 19)
                    .string('')
                    .style(style);
            }
            if (data.horaConciliacion) {
                global_ws.cell( row + 2, 20)
                    .date(new Date(data.horaConciliacion + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 20)
                    .string('');
            }
            if (data.usuario) {
                global_ws.cell( row + 2, 21)
                    .string(data.usuario.nombreReal)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 21)
                    .string('')
                    .style(style);
            }
        }
        let monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril' ,'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let aux1 = new  Date(initialDate).getMonth();
        let aux2 = new  Date(finalDate).getMonth();
        return wb.write(`${monthsList[aux1]} a ${monthsList[aux2]}-Registro de Datos-OR.xlsx`, res);
    }).catch(err => {
        return res.status(500).json({
            err
        });
    });
}

/**
 * Generates an excel file with Operador de Base data
 * @param {Request} req Request Object containing request data
 * @param {Response} res Response Object
 */
function generateRegistroDePenalidades(req, res) {
    let initialDate = Number(req.query.fromDate) || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours() - 24, new Date().getMinutes(), 0, 0).getTime();
    let finalDate = Number(req.query.toDate)  || new Date().getTime();

    let where = {
        horaDeRecepcion: {
            [Op.and]: {
                [Op.gte]: initialDate,
                [Op.lt]: finalDate
            }
        }
    };
    // Query the data
    RegistroDePenalidades.findAndCountAll({
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
        let wb = new Excel.Workbook();

        // Add Worksheets to the workbook
        let global_ws = wb.addWorksheet('Global');
        // let bassam_ws = wb.addWorksheet('Bassam');
        // let tk_ws = wb.addWorksheet('TK');

        let style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0'
        });

        global_ws.column(1).setWidth(15);
        global_ws.column(2).setWidth(15);
        global_ws.column(3).setWidth(22);
        global_ws.column(4).setWidth(22);
        global_ws.column(5).setWidth(15);
        global_ws.column(6).setWidth(30);
        global_ws.column(7).setWidth(30);
        global_ws.column(8).setWidth(30);
        global_ws.column(9).setWidth(30);
        global_ws.column(10).setWidth(40);
        global_ws.column(11).setWidth(30);
        global_ws.column(12).setWidth(30);
        global_ws.column(13).setWidth(30);
        global_ws.column(14).setWidth(30);

        let tableHeaders = [
            'Item',
            'Tipo de Penalidad',
            'Sigma de recepción',
            'Ruta',
            'Móvil',
            'Detalle',
            'Hora de Recepción',
            'Supervisor',
            'Respuesta',
            'Hora de de Respuesta',
            'Contra-respuesta',
            'Hora de Contra-respuesta',
            'Comentarios',
            'Usuario'
        ]

        for (let col = 0; col < tableHeaders.length; col++) {
            const header = tableHeaders[col];
            global_ws.cell(1, 1 + col)
                .string(header)
                .style(style);
        }

        for (let row = 0; row < reply.rows.length; row++) {
            const element = reply.rows[row];
            let data = element.toJSON();
            if (data.item) {
                global_ws.cell( row + 2, 1)
                    .string(data.item);
            } else {
                global_ws.cell( row + 2, 1)
                    .string('');
            }
            if (data.tipoDePenalidad) {
                global_ws.cell( row + 2, 2)
                    .string(data.tipoDePenalidad)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 2)
                    .string('')
                    .style(style);
            }
            if (data.sigma) {
                global_ws.cell( row + 2, 3)
                    .string(data.sigma)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 3)
                    .string('')
                    .style(style);
            }
            if (data.ruta) {
                global_ws.cell( row + 2, 4)
                    .string(data.ruta.ruta)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 4)
                    .string('')
                    .style(style);
            }
            if (data.vehiculo) {
                global_ws.cell( row + 2, 5)
                    .string(data.vehiculo.movil)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 5)
                    .string('')
                    .style(style);
            }
            if (data.detalle) {
                global_ws.cell( row + 2, 6)
                    .string(data.detalle)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 6)
                    .string('')
                    .style(style);
            }
            if (data.horaDeRecepcion) {
                global_ws.cell( row + 2, 7)
                    .date(new Date(data.horaDeRecepcion + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 7)
                    .string('');
            }
            if (data.supervisore) {
                global_ws.cell( row + 2, 8)
                    .string(data.supervisore.zona)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 8)
                    .string('')
                    .style(style);
            }
            if (data.respuesta) {
                global_ws.cell( row + 2, 9)
                    .string(data.respuesta)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 9)
                    .string('')
                    .style(style);
            }
            if (data.horaDeRespuesta) {
                global_ws.cell( row + 2, 10)
                    .date(new Date(data.horaDeRespuesta + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 10)
                    .string('');
            }
            if (data.contrarespuesta) {
                global_ws.cell( row + 2, 11)
                    .string(data.contrarespuesta)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 11)
                    .string('')
                    .style(style);
            }
            if (data.horaDeContrarespuesta) {
                global_ws.cell( row + 2, 12)
                    .date(new Date(data.horaDeContrarespuesta + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 12)
                    .string('');
            }
            if (data.comentarios) {
                global_ws.cell( row + 2, 13)
                    .string(data.comentarios)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 13)
                    .string('')
                    .style(style);
            }
            if (data.usuario) {
                global_ws.cell( row + 2, 14)
                    .string(data.usuario.nombreReal)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 14)
                    .string('')
                    .style(style);
            }
        }
        let monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril' ,'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let aux1 = new Date(initialDate).getMonth();
        let aux2 = new  Date(finalDate).getMonth();
        return wb.write(`${monthsList[aux1]} a ${monthsList[aux2]}-Registro de Penalidades.xlsx`, res);
    }).catch(err => {
        return res.status(500).json({
            err
        });
    });
}

/**
 * Generates an excel file with Operador de Base data
 * @param {Request} req Request Object containing request data
 * @param {Response} res Response Object
 */
function generateRegistroDeHorarios(req, res) {
    let initialDate = Number(req.query.fromDate) || new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours() - 24, new Date().getMinutes(), 0, 0).getTime();
    let finalDate = Number(req.query.toDate)  || new Date().getTime();

    let where = {
        salidaBase: {
            [Op.and]: {
                [Op.gte]: initialDate,
                [Op.lt]: finalDate
            }
        }
    };
    // Query the data
    CicloDeHorarios.findAndCountAll({
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
        let wb = new Excel.Workbook();

        // Add Worksheets to the workbook
        let global_ws = wb.addWorksheet('Global');
        // let bassam_ws = wb.addWorksheet('Bassam');
        // let tk_ws = wb.addWorksheet('TK');

        let style = wb.createStyle({
            font: {
                color: '#000000',
                size: 12,
            },
            numberFormat: '#,##0.00; (#,##0.00); 0'
        });

        global_ws.column(1).setWidth(15);
        global_ws.column(2).setWidth(15);
        global_ws.column(3).setWidth(22);
        global_ws.column(4).setWidth(22);
        global_ws.column(5).setWidth(15);
        global_ws.column(6).setWidth(30);
        global_ws.column(7).setWidth(30);
        global_ws.column(8).setWidth(30);
        global_ws.column(9).setWidth(30);
        global_ws.column(10).setWidth(40);
        global_ws.column(11).setWidth(30);
        global_ws.column(12).setWidth(30);
        global_ws.column(13).setWidth(30);
        global_ws.column(14).setWidth(30);
        global_ws.column(15).setWidth(30);
        global_ws.column(16).setWidth(30);

        let tableHeaders = [
            'Móvil',
            'Ayudantes',
            'Ruta',
            'Conductor',
            'Salida Base',
            'Inicio Ruta',
            'Final Ruta',
            'Abandono Ruta',
            'Salida Relleno',
            'Ingreso Relleno',
            'Inicio Almuerzo',
            'Final Almuerzo',
            'Regreso Base',
            'Comentarios',
            'Modificaciones',
            'Usuarios'
        ]

        for (let col = 0; col < tableHeaders.length; col++) {
            const header = tableHeaders[col];
            global_ws.cell(1, 1 + col)
                .string(header)
                .style(style);
        }

        for (let row = 0; row < reply.rows.length; row++) {
            const element = reply.rows[row];
            let data = element.toJSON();
            if (data.registro_de_horario.vehiculo) {
                global_ws.cell( row + 2, 1)
                    .string(data.registro_de_horario.vehiculo.movil);
            } else {
                global_ws.cell( row + 2, 1)
                    .string('');
            }
            if (data.registro_de_horario.ayudantes) {
                global_ws.cell( row + 2, 2)
                    .number(data.registro_de_horario.ayudantes)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 2)
                    .number(0)
                    .style(style);
            }
            if (data.registro_de_horario.ruta) {
                global_ws.cell( row + 2, 3)
                    .string(data.registro_de_horario.ruta.ruta)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 3)
                    .string('')
                    .style(style);
            }
            if (data.registro_de_horario.personal) {
                global_ws.cell( row + 2, 4)
                    .string(data.registro_de_horario.personal.nombre)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 4)
                    .string('')
                    .style(style);
            }
            if (data.salidaBase) {
                global_ws.cell( row + 2, 5)
                    .date(new Date(data.salidaBase + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 5)
                    .string('');
            }
            if (data.inicioRuta) {
                global_ws.cell( row + 2, 6)
                    .date(new Date(data.inicioRuta + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 6)
                    .string('');
            }
            if (data.finRuta) {
                global_ws.cell( row + 2, 7)
                    .date(new Date(data.finRuta + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 7)
                    .string('');
            }
            if (data.abandonoRuta) {
                global_ws.cell( row + 2, 8)
                    .date(new Date(data.abandonoRuta + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 8)
                    .string('');
            }
            if (data.salidaRelleno) {
                global_ws.cell( row + 2, 9)
                    .date(new Date(data.salidaRelleno + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 9)
                    .string('');
            }
            if (data.ingresoRelleno) {
                global_ws.cell( row + 2, 10)
                    .date(new Date(data.ingresoRelleno + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 10)
                    .string('');
            }
            if (data.inicioAlmuerzo) {
                global_ws.cell( row + 2, 11)
                    .date(new Date(data.inicioAlmuerzo + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 11)
                    .string('');
            }
            if (data.finalAlmuerzo) {
                global_ws.cell( row + 2, 12)
                    .date(new Date(data.finalAlmuerzo + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 12)
                    .string('');
            }
            if (data.regresoBase) {
                global_ws.cell( row + 2, 13)
                    .date(new Date(data.regresoBase + timezoneOffset));
            } else {
                global_ws.cell( row + 2, 13)
                    .string('');
            }
            if (data.comentarios) {
                global_ws.cell( row + 2, 14)
                    .string(data.comentarios)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 14)
                    .string('')
                    .style(style);
            }
            if (data.modificaciones) {
                global_ws.cell( row + 2, 15)
                    .string(data.modificaciones)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 15)
                    .string('')
                    .style(style);
            }
            if (data.registro_de_horario.usuario) {
                global_ws.cell( row + 2, 16)
                    .string(data.registro_de_horario.usuario.nombreReal)
                    .style(style);
            } else {
                global_ws.cell( row + 2, 16)
                    .string('')
                    .style(style);
            }
        }
        let monthsList = ['Enero', 'Febrero', 'Marzo', 'Abril' ,'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        let aux1 = new Date(initialDate).getMonth();
        let aux2 = new  Date(finalDate).getMonth();
        return wb.write(`${monthsList[aux1]} a ${monthsList[aux2]}-Registro de Horarios.xlsx`, res);
    }).catch(err => {
        return res.status(500).json({
            err
        });
    });
}


app.get('/reports/:app', verifyTokenByURL, (req, res) => {
    let currentApp = req.params.app;

    let allowedApps = ['estacion_de_servicio', 'operador_de_base', 'registro_de_horarios', 'registro_de_penalidades', 'registro_de_datos'];

    if(!allowedApps.includes(currentApp)) {
        return res.json({
            err: {
                message: `${currentApp} no es un reporte`,
                allowedReports: allowedApps.join(', ')
            }
        });
    }

    let user = req.user;

    if (currentApp == 'estacion_de_servicio') {
        if(user.permisos.includes('es_leer')) {
            generateEstacionServicio(req, res);
        }else{
            return res.status(403).json({
                err: {
                    message: 'Acceso denegado'
                }
            });
        }
    }
    if (currentApp == 'operador_de_base') {
        if(user.permisos.includes('io_leer')) {
            generateOperadorBase(req, res);
        }else{
            return res.status(403).json({
                err: {
                    message: 'Acceso denegado'
                }
            });
        }
    }
    if (currentApp == 'registro_de_horarios') {
        if(user.permisos.includes('or_leer')) {
            generateRegistroDeHorarios(req, res);
        }else{
            return res.status(403).json({
                err: {
                    message: 'Acceso denegado'
                }
            });
        }
    }
    if (currentApp == 'registro_de_penalidades') {
        if(user.permisos.includes('or_leer')) {
            generateRegistroDePenalidades(req, res);
        }else{
            return res.status(403).json({
                err: {
                    message: 'Acceso denegado'
                }
            });
        }
    }
    if (currentApp == 'registro_de_datos') {
        if(user.permisos.includes('or_leer')) {
            generateRegistroDeDatos(req, res);
        }else{
            return res.status(403).json({
                err: {
                    message: 'Acceso denegado'
                }
            });
        }
    }
});

module.exports = app;
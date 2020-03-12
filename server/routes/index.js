/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/


const express = require('express');
const app = express();


// Core
app.use(require('./users'));
app.use(require('./personnel'));
app.use(require('./vehicles'));
app.use(require('./routes'));

// Otros
app.use(require('./conductores'));
app.use(require('./servicios'));
app.use(require('./proyectos'));

// login
app.use(require('./login'));

// Finanzas
app.use(require('./finanzas'));
app.use(require('./LineasDeCredito'));
app.use(require('./PlanesDePago'));

// Operador de radio
app.use(require('./operadorRadio'));

// Estacion de servicio
app.use(require('./estacionServicio'));

// Operador de base
app.use(require('./operadorBase'));

// Report generator
app.use(require('./reportGenerator'));

// Repo updater
app.use(require('./app/updateRepo'));



module.exports = app;
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

// login
app.use(require('./login'));

// Finanzas
app.use(require('./finanzas'));
app.use(require('./LineasDeCredito'));
app.use(require('./PlanesDePago'));



module.exports = app;
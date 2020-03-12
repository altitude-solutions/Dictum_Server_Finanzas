/**
 *
 * @title:             Service for pushing updates to apps
 *
 * @author:            Javier Contreras
 * @email:             javier.contreras@altitudesolutions.org
 *
 * @description:       Updates delivery service
 *
 **/


// ===============================================
// External modules
// ===============================================
const express = require('express');
const app = express();
const unzipper = require('unzipper');
const fileUploader = require('express-fileupload');
app.use(fileUploader());

// ===============================================
// Node modules
// ===============================================
const fs = require('fs');
const path = require('path');

// ===============================================
// Middlewares
// ===============================================
const { verifyToken } = require('../../middlewares/authentication');

// ===============================================
// Upload
// ===============================================
app.post('/update_delivery', verifyToken, (req, res) => {
    let user = req.user;
    let savePath = path.resolve(__dirname, '../../../uploads');
    if (!req.files) {
        return res.status(400).json({
            err: {
                message: 'Por favor seleccione un archivo'
            }
        });
    }

    if( user.permisos.includes('es_escribir') && user.permisos.includes('or_escribir') && user.permisos.includes('u_escribir') && user.permisos.includes('ru_escribir') && user.permisos.includes('p_escribir') && user.permisos.includes('ve_escribir') && user.permisos.includes('io_escribir') && user.permisos.includes('fin_escribir') && user.permisos.includes('pro_escribir')){
        let package = req.files.package;
        // Evaluate extentions
        let extentions = ['zip'];
        let fileName = package.name.split('.');
        let extention = fileName[fileName.length - 1];
        if (!extentions.includes(extention)) {
            return res.status(400).json({
                err: {
                    message: 'La extension permitida es: ' + extentions.join(', '),
                    ext: extention
                }
            });
        }
        package.mv(path.resolve(savePath, package.name), err => {
            if (err) {
                return res.status(500).json({
                    err
                });
            }
            let pathToRepo = path.resolve(__dirname, '../../../public', 'repo');
            fs.createReadStream(path.resolve(savePath, package.name))
                .pipe(unzipper.Extract({ path: pathToRepo }))
                .promise()
                .then(() => {
                    fs.unlink(path.resolve(savePath, package.name), (err) => {});
                    res.json({
                        repo: pathToRepo + ' fue cargado con éxito'
                    });
                })
                .catch(err => {
                    return res.status(500).json({
                        err
                    });
                });
        });
    }else{
        return  res.status(403).json({
            err: {
                message: 'Acceso denegado'
            }
        });
    }
});

module.exports = app;
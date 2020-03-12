/**
 *
 * @author:   Javier Contreras
 * @email:    javier.contreras@altitudesolutions.org
 *
 **/


const jwt = require('jsonwebtoken');

// ===============================================
// Verify token
// ===============================================
let verifyToken = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                err
            });
        } else {
            req.user = decoded.user;

            if( req.user.nombreUsuario != undefined && req.user.nombreReal != undefined && req.user.permisos != undefined ) {
                next();
            } else {
                return res.status(400).json({
                    err: {
                        message: 'Usuario no identificado'
                    }
                });
            }
        }
    });
};

// ===============================================
// Verify token by url
// ===============================================
let verifyTokenByURL = (req, res, next) => {
    let token = String(req.query.token);

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                err
            });
        } else {
            req.user = decoded.user;

            if( req.user.nombreUsuario != undefined && req.user.nombreReal != undefined && req.user.permisos != undefined ) {
                next();
            } else {
                return res.status(400).json({
                    err: {
                        message: 'Usuario no identificado'
                    }
                });
            }
        }
    });
};


module.exports = {
    verifyToken,
    verifyTokenByURL
}
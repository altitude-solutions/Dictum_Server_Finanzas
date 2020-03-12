const { Sequelize } = require('sequelize');

let db_user = '';
let db_password = '';

if (process.env.NODE_ENV != 'dev') {
    db_user =  process.env.DICTUM_USER;
    db_password = process.env.DICTUM_PASS;
} else {
    db_user = 'root';
    db_password = 'Altitude2020';
}

const sql = new Sequelize('DICTUM', db_user, db_password, {
    host: 'localhost',
    dialect: 'mariadb',
    logging: false,
    dialectOptions: {
        timezone: 'Etc/GMT0' //for writing to database
    }
});

module.exports = {
    sql
}
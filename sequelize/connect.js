const Sequelize = require('sequelize');
const keys = require('../config/keys')

const sequelize = new Sequelize(keys.dbName, keys.dbUser, keys.dbPassword, {
    host: keys.dbHost,
    dialect: 'mysql',
    logging: false
});

sequelize
    .authenticate()
    .then(() => {
        console.log('Sequelize: Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Sequelize: Unable to connect to the database:', err);
    });

module.exports = sequelize
const Sequelize = require('sequelize');
const sequelize = require('../connect');

const Model = Sequelize.Model;
class Admin extends Model {}

Admin.init({
    // attributes
    login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'admins',
    timestamps: false
});

module.exports = Admin

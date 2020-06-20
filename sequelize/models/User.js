const Sequelize = require('sequelize');
const sequelize = require('../connect');

const Model = Sequelize.Model;
class User extends Model {}

User.init({
    // attributes
    login: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sirname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'users',
    timestamps: false
});

module.exports = User

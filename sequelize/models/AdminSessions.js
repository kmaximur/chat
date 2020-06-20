const Sequelize = require('sequelize');
const sequelize = require('../connect');

const Model = Sequelize.Model;
class AdminSessions extends Model {}

AdminSessions.init({
    // attributes
    admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'admin_sessions',
    timestamps: false
});

module.exports = AdminSessions

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const errorHandler = require('../utils/errorHandler')
const crypto = require('crypto')
const User = require('../sequelize/models/User')
const Admin = require('../sequelize/models/Admin')
const AdminSessions = require('../sequelize/models/AdminSessions')

module.exports.login = async function (req, res) {
    try {
        const candidate = await User.findOne({where: {login: req.body.login}})
        if (candidate) {
            const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
            if (passwordResult) {
                const token = jwt.sign({
                    login: candidate.login,
                    userId: candidate.id,
                    name: candidate.name,
                    sirname: candidate.sirname
                }, keys.jwt, {expiresIn: 60 * 60 * 24})
                res.status(200).json({
                    token,
                    success: true
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Incorrect password. Try it again'
                })
            }
        } else {
            res.status(404).json({
                success: false,
                message: 'User with this login was not found'
            })
        }
    } catch (e) {
        errorHandler(res, e)
    }
}


module.exports.adminLogin = async function (req, res) {
    try {
        const candidate = await Admin.findOne({where: {login: req.body.login}})
        if (candidate) {
            const passwordResult = bcrypt.compareSync(req.body.password, candidate.password)
            if (passwordResult) {
                await AdminSessions.create({
                    admin_id: candidate.id,
                })
                const token = jwt.sign({
                    login: candidate.login,
                    userId: candidate.id
                }, keys.jwt, {expiresIn: 60 * 60 * 24})
                res.status(200).json({
                    token,
                    success: true
                })
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Incorrect password. Try it again'
                })
            }
        } else {
            res.status(404).json({
                success: false,
                message: 'User with this login was not found'
            })
        }
    } catch (e) {
        errorHandler(res, e)
    }
}


module.exports.register = async function (req, res) {
    try {
        const candidate = await User.findOne({where: {login: req.body.login}})
        if (candidate) {
            return res.status(409).json({
                success: false,
                message: 'This login is already in use, try another'
            })
        } else {
            crypto.randomBytes(32, async (err, buffer) => {
                if (err) {
                    return res.status(404).json({
                        success: false,
                        message: 'Something went wrong, try again later'
                    })
                }
                const salt = bcrypt.genSaltSync(10);
                const password = req.body.password;
                await User.create({
                    login: req.body.login,
                    name: req.body.name,
                    sirname: req.body.sirname,
                    password: bcrypt.hashSync(password, salt)
                })
                res.status(201).json({
                    register: true
                })
            })
        }
    } catch (e) {
        errorHandler(res, e)
    }
}
const express = require('express')
const controller = require('../controllers/auth')
const router = express.Router()

router.post('/login', controller.login)
router.post('/register', controller.register)
router.post('/admin', controller.adminLogin)

module.exports = router
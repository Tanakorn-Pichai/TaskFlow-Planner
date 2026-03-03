const router = require('express').Router()
const authController = require('../controllers/authController')

// แสดงหน้า Login
router.get('/login', authController.loginForm)

// รับค่า Login
router.post('/login', authController.login)

// Logout
router.get('/logout', authController.logout)

module.exports = router
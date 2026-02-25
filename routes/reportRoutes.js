const router = require('express').Router()
const controller = require('../controllers/reportController')

router.get('/dashboard', controller.productivityDashboard)
router.get('/user-performance', controller.userPerformance)

module.exports = router
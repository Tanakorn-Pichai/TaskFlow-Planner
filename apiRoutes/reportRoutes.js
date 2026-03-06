const router = require('express').Router()
const reportController = require('../apiControllers/reportController')

router.get('/longest-tasks', reportController.longestTasks)
router.get('/user-performance', reportController.userPerformance)

module.exports = router
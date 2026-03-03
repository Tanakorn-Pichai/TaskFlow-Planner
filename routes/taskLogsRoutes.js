const router = require('express').Router()
const controller = require('../controllers/taskLogsController')

router.get('/', controller.index)
router.get('/show/:id', controller.show)

module.exports = router
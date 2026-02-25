const router = require('express').Router()
const controller = require('../controllers/taskLogsController')

router.get('/', controller.index)
router.get('/create', controller.createForm)
router.post('/create', controller.create)
router.get('/delete/:id', controller.delete)
router.get('/show/:id', controller.show)
module.exports = router
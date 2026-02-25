const router = require('express').Router()
const controller = require('../controllers/tasksController')

router.get('/', controller.index)
router.get('/create', controller.createForm)
router.post('/create', controller.create)
router.get('/edit/:id', controller.editForm)
router.post('/edit/:id', controller.update)
router.get('/delete/:id', controller.delete)
router.get('/show/:id', controller.show)
module.exports = router
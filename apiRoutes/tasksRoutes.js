const router = require('express').Router()
const tasksController = require('../apiControllers/tasksController')

router.get('/', tasksController.index)
router.get('/:id', tasksController.show)
router.post('/', tasksController.create)
router.put('/:id', tasksController.update)
router.delete('/:id', tasksController.delete)

module.exports = router
const router = require('express').Router()
const projectsController = require('../apiControllers/projectsController')

router.get('/', projectsController.index)
router.get('/:id', projectsController.show)
router.post('/', projectsController.create)
router.put('/:id', projectsController.update)
router.delete('/:id', projectsController.delete)

module.exports = router
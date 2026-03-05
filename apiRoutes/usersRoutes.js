const router = require('express').Router()
const usersController = require('../apiControllers/usersController')

router.get('/', usersController.index)
router.get('/:id', usersController.show)
router.post('/', usersController.create)
router.put('/:id', usersController.update)
router.delete('/:id', usersController.delete)

module.exports = router
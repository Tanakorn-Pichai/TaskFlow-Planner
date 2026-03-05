const router = require('express').Router()
const taskLogsController = require('../apiControllers/taskLogsController')

router.get('/', taskLogsController.index)
router.get('/:id', taskLogsController.show)
router.post('/', taskLogsController.create)
router.put('/:id', taskLogsController.update)
router.delete('/:id', taskLogsController.delete)

module.exports = router
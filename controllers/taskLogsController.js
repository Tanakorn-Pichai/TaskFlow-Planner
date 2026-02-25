const { TaskLog, Task } = require('../models')

exports.index = async (req, res) => {
  const logs = await TaskLog.findAll({ include: Task })
  res.render('task_logs/index', { logs })
}

exports.createForm = async (req, res) => {
  const tasks = await Task.findAll()
  res.render('task_logs/create', { tasks })
}

exports.create = async (req, res) => {
  await TaskLog.create(req.body)
  res.redirect('/task-logs')
}

exports.delete = async (req, res) => {
  await TaskLog.destroy({ where: { log_id: req.params.id } })
  res.redirect('/task-logs')
}
exports.show = async (req, res) => {
  const log = await TaskLog.findByPk(req.params.id, {
    include: require('../models').Task
  })
  res.render('task_logs/show', { log })
}
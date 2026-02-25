const { Task, Project } = require('../models')

exports.index = async (req, res) => {
  const tasks = await Task.findAll({ include: Project })
  res.render('tasks/index', { tasks })
}

exports.createForm = async (req, res) => {
  const projects = await Project.findAll()
  res.render('tasks/create', { projects })
}

exports.create = async (req, res) => {
  await Task.create(req.body)
  res.redirect('/tasks')
}

exports.editForm = async (req, res) => {
  const task = await Task.findByPk(req.params.id)
  const projects = await Project.findAll()
  res.render('tasks/edit', { task, projects })
}

exports.update = async (req, res) => {
  await Task.update(req.body, { where: { task_id: req.params.id } })
  res.redirect('/tasks')
}

exports.delete = async (req, res) => {
  await Task.destroy({ where: { task_id: req.params.id } })
  res.redirect('/tasks')
}
exports.show = async (req, res) => {
  const task = await Task.findByPk(req.params.id, {
    include: require('../models').Project
  })
  res.render('tasks/show', { task })
}
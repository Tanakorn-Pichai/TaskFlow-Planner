const { Project, User } = require('../models')

exports.index = async (req, res) => {
  const projects = await Project.findAll({ include: User })
  res.render('projects/index', { projects })
}

exports.createForm = async (req, res) => {
  const users = await User.findAll()
  res.render('projects/create', { users })
}

exports.create = async (req, res) => {
  await Project.create(req.body)
  res.redirect('/projects')
}

exports.editForm = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  const users = await User.findAll()
  res.render('projects/edit', { project, users })
}

exports.update = async (req, res) => {
  await Project.update(req.body, { where: { project_id: req.params.id } })
  res.redirect('/projects')
}

exports.delete = async (req, res) => {
  await Project.destroy({ where: { project_id: req.params.id } })
  res.redirect('/projects')
}

exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: require('../models').User
  })
  res.render('projects/show', { project })
}
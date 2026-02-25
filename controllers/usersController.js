const { User } = require('../models')

exports.index = async (req, res) => {
  const users = await User.findAll()
  res.render('users/index', { users })
}

exports.createForm = (req, res) => {
  res.render('users/create')
}

exports.create = async (req, res) => {
  await User.create(req.body)
  res.redirect('/users')
}

exports.editForm = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  res.render('users/edit', { user })
}

exports.update = async (req, res) => {
  await User.update(req.body, { where: { user_id: req.params.id } })
  res.redirect('/users')
}

exports.delete = async (req, res) => {
  await User.destroy({ where: { user_id: req.params.id } })
  res.redirect('/users')
}
exports.show = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  res.render('users/show', { user })
}
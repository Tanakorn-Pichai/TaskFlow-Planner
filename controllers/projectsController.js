const { Project, User } = require('../models')

exports.index = async (req, res) => {
  const user = req.session.user
  let projects

  if (user.role === 'admin') {
    projects = await Project.findAll({ include: User })
  } else {
   projects = await Project.findAll({
  where: { user_id: user.user_id },
  include: User
})
  }

  res.render('projects/index', { projects })
}

exports.createForm = async (req, res) => {
  const users = await User.findAll()
  res.render('projects/create', { users })
}

exports.create = async (req, res) => {
  const user = req.session.user

  await Project.create({
    project_name: req.body.project_name,
    start_date: req.body.start_date,
    end_date: req.body.end_date,
    status: req.body.status,
    user_id: user.role === 'admin'
      ? req.body.user_id
      : user.user_id
  })

  res.redirect('/projects')
}

exports.editForm = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  const user = req.session.user

  if (!project) return res.redirect('/projects')

  if (
    user.role !== 'admin' &&
    project.user_id !== user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  const users = await User.findAll()
  res.render('projects/edit', { project, users })
}

exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  const user = req.session.user

  if (
    user.role !== 'admin' &&
    project.user_id !== user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  await Project.update({
  project_name: req.body.project_name,
  start_date: req.body.start_date,
  end_date: req.body.end_date,
  status: req.body.status,
  user_id: req.session.user.role === 'admin'
    ? req.body.user_id
    : req.session.user.user_id
}, {
  where: { project_id: req.params.id }
})

  res.redirect('/projects')
}

exports.delete = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  const user = req.session.user

  if (
    user.role !== 'admin' &&
    project.user_id !== user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  await project.destroy()
  res.redirect('/projects')
}

exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: User
  })

  const user = req.session.user

  if (
    user.role !== 'admin' &&
    project.user_id !== user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  res.render('projects/show', { project })
}
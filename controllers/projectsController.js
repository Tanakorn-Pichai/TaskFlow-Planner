const { Project, User } = require('../models')

// =============================
// LIST PROJECTS
// =============================
exports.index = async (req, res) => {
  try {
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

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to load projects')
    res.redirect('/')
  }
}

// =============================
// CREATE FORM
// =============================
exports.createForm = async (req, res) => {
  const users = await User.findAll()
  res.render('projects/create', { users })
}

// =============================
// CREATE PROJECT
// =============================
exports.create = async (req, res) => {
  try {
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

    req.flash('success', 'Project created successfully 🎉')
    res.redirect('/projects')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to create project')
    res.redirect('/projects/create')
  }
}

// =============================
// EDIT FORM
// =============================
exports.editForm = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  const user = req.session.user

  if (!project) {
    req.flash('error', 'Project not found')
    return res.redirect('/projects')
  }

  if (user.role !== 'admin' && project.user_id !== user.user_id) {
    req.flash('error', 'Access Denied')
    return res.redirect('/projects')
  }

  const users = await User.findAll()
  res.render('projects/edit', { project, users })
}

// =============================
// UPDATE PROJECT
// =============================
exports.update = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    const user = req.session.user

    if (!project) {
      req.flash('error', 'Project not found')
      return res.redirect('/projects')
    }

    if (user.role !== 'admin' && project.user_id !== user.user_id) {
      req.flash('error', 'Access Denied')
      return res.redirect('/projects')
    }

    await project.update({
      project_name: req.body.project_name,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      status: req.body.status,
      user_id: user.role === 'admin'
        ? req.body.user_id
        : user.user_id
    })

    req.flash('success', 'Project updated successfully ✅')
    res.redirect('/projects')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to update project')
    res.redirect('/projects')
  }
}

// =============================
// DELETE PROJECT
// =============================
exports.delete = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)
    const user = req.session.user

    if (!project) {
      req.flash('error', 'Project not found')
      return res.redirect('/projects')
    }

    if (user.role !== 'admin' && project.user_id !== user.user_id) {
      req.flash('error', 'Access Denied')
      return res.redirect('/projects')
    }

    await project.destroy()

    req.flash('success', 'Project deleted successfully 🗑️')
    res.redirect('/projects')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to delete project')
    res.redirect('/projects')
  }
}

// =============================
// SHOW PROJECT
// =============================
exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: User
  })

  const user = req.session.user

  if (!project) {
    req.flash('error', 'Project not found')
    return res.redirect('/projects')
  }

  if (user.role !== 'admin' && project.user_id !== user.user_id) {
    req.flash('error', 'Access Denied')
    return res.redirect('/projects')
  }

  res.render('projects/show', { project })
}
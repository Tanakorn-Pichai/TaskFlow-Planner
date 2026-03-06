const { Task, Project, User, TaskLog } = require('../models')

/* =========================
   INDEX
========================= */
exports.index = async (req, res) => {
  try {
    const user = req.session.user
    let tasks

    if (user.role === 'admin') {
      tasks = await Task.findAll({
        include: [{
          model: Project,
          include: [User]
        }]
      })
    } else {
      tasks = await Task.findAll({
        include: [{
          model: Project,
          where: { user_id: user.user_id },
          include: [User],
          required: true
        }]
      })
    }

    res.render('tasks/index', { tasks })

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to load tasks')
    res.redirect('/')
  }
}

/* =========================
   CREATE FORM
========================= */
exports.createForm = async (req, res) => {
  const user = req.session.user
  let users, projects, taskCount

  if (user.role === 'admin') {
    users = await User.findAll({ include: [Project] })
    projects = await Project.findAll()
    taskCount = await Task.count()
  } else {
    users = await User.findAll({
      where: { user_id: user.user_id },
      include: [Project]
    })
    projects = await Project.findAll({ where: { user_id: user.user_id } })
    taskCount = await Task.count({
      include: [{
        model: Project,
        where: { user_id: user.user_id },
        required: true
      }]
    })
  }

  res.render('tasks/create', { users, projects, user, taskCount })
}

/* =========================
   CREATE
========================= */
exports.create = async (req, res) => {
  try {
    const user = req.session.user

    const project = await Project.findByPk(req.body.project_id)
    if (!project) {
      req.flash('error', 'Project not found')
      return res.redirect('/tasks')
    }

    if (user.role !== 'admin' && project.user_id !== user.user_id) {
      req.flash('error', 'Access Denied')
      return res.redirect('/tasks')
    }

    const lastTask = await Task.findOne({
      order: [['task_id', 'DESC']]
    })

    const nextNumber = lastTask ? lastTask.task_id + 1 : 1

    const newTask = await Task.create({
      ...req.body,
      title: `Task #${nextNumber}`
    })

    await TaskLog.create({
      task_id: newTask.task_id,
      action: 'CREATE',
      description: `Task created by ${user.name}`
    })

    req.flash('success', 'Task created successfully 🎉')
    res.redirect('/tasks')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to create task')
    res.redirect('/tasks')
  }
}

/* =========================
   EDIT FORM
========================= */
exports.editForm = async (req, res) => {
  const task = await Task.findByPk(req.params.id, {
    include: {
      model: Project,
      include: User
    }
  })

  if (!task) {
    req.flash('error', 'Task not found')
    return res.redirect('/tasks')
  }

  if (
    req.session.user.role !== 'admin' &&
    task.Project.user_id !== req.session.user.user_id
  ) {
    req.flash('error', 'Access Denied')
    return res.redirect('/tasks')
  }

  const users = await User.findAll({ include: Project })

  res.render('tasks/edit', { task, users })
}

/* =========================
   UPDATE
========================= */
exports.update = async (req, res) => {
  try {
    const user = req.session.user

    const task = await Task.findByPk(req.params.id, {
      include: Project
    })

    if (!task) {
      req.flash('error', 'Task not found')
      return res.redirect('/tasks')
    }

    if (user.role !== 'admin' && task.Project.user_id !== user.user_id) {
      req.flash('error', 'Access Denied')
      return res.redirect('/tasks')
    }

    await task.update(req.body)

    await TaskLog.create({
      task_id: task.task_id,
      action: 'UPDATE',
      description: `Task updated by ${user.name}`
    })

    req.flash('success', 'Task updated successfully ✅')
    res.redirect('/tasks')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to update task')
    res.redirect('/tasks')
  }
}

/* =========================
   DELETE
========================= */
exports.delete = async (req, res) => {
  try {
    const user = req.session.user

    const task = await Task.findByPk(req.params.id, {
      include: Project
    })

    if (!task) {
      req.flash('error', 'Task not found')
      return res.redirect('/tasks')
    }

    if (user.role !== 'admin' && task.Project.user_id !== user.user_id) {
      req.flash('error', 'Access Denied')
      return res.redirect('/tasks')
    }

    await TaskLog.create({
      task_id: task.task_id,
      action: 'DELETE',
      description: `Task deleted by ${user.name}`
    })

    await task.destroy()

    req.flash('success', 'Task deleted successfully 🗑️')
    res.redirect('/tasks')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to delete task')
    res.redirect('/tasks')
  }
}

/* =========================
   SHOW
========================= */
exports.show = async (req, res) => {
  const task = await Task.findByPk(req.params.id, {
    include: [{
      model: Project,
      include: [User]
    }]
  })

  if (!task) {
    req.flash('error', 'Task not found')
    return res.redirect('/tasks')
  }

  if (
    req.session.user.role !== 'admin' &&
    task.Project.user_id !== req.session.user.user_id
  ) {
    req.flash('error', 'Access Denied')
    return res.redirect('/tasks')
  }

  res.render('tasks/show', { task })
}
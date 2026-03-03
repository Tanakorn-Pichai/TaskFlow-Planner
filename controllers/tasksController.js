const { Task, Project, User, TaskLog } = require('../models')
/* =========================
   INDEX
========================= */
exports.index = async (req, res) => {
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
}


/* =========================
   CREATE FORM
========================= */
exports.createForm = async (req, res) => {
  const user = req.session.user
  let users

  if (user.role === 'admin') {

    users = await User.findAll({
      include: [Project]
    })

  } else {

    users = await User.findAll({
      where: { user_id: user.user_id },
      include: [Project]
    })

  }

  res.render('tasks/create', { users })
}

/* =========================
   CREATE
========================= */
exports.create = async (req, res) => {
  try {
    const user = req.session.user

    const project = await Project.findByPk(req.body.project_id)

    if (!project) return res.status(404).send('Project not found')

    if (
      user.role !== 'admin' &&
      project.user_id !== user.user_id
    ) {
      return res.status(403).send('Access Denied')
    }

    const lastTask = await Task.findOne({
      order: [['task_id', 'DESC']]
    })

    const nextNumber = lastTask ? lastTask.task_id + 1 : 1

    const newTask = await Task.create({
      ...req.body,
      title: `Task #${nextNumber}`
    })

    // 🔥 CREATE LOG
    await TaskLog.create({
      task_id: newTask.task_id,
      action: 'CREATE',
      description: `Task created by ${user.name}`
    })

    res.redirect('/tasks')

  } catch (error) {
    console.error(error)
    res.send(error.message)
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

  if (!task) return res.send("Task not found")

  // 🔐 check owner
  if (
    req.session.user.role !== 'admin' &&
    task.Project.user_id !== req.session.user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  const users = await User.findAll({ include: Project })

  res.render('tasks/edit', { task, users })
}


/* =========================
   UPDATE
========================= */
exports.update = async (req, res) => {

  const user = req.session.user

  const task = await Task.findByPk(req.params.id, {
    include: Project
  })

  if (
    user.role !== 'admin' &&
    task.Project.user_id !== user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  await Task.update(req.body, {
    where: { task_id: req.params.id }
  })

  // 🔥 CREATE LOG
  await TaskLog.create({
    task_id: task.task_id,
    action: 'UPDATE',
    description: `Task updated by ${user.name}`
  })

  res.redirect('/tasks')
}

/* =========================
   DELETE
========================= */
exports.delete = async (req, res) => {

  const user = req.session.user

  const task = await Task.findByPk(req.params.id, {
    include: Project
  })

  if (
    user.role !== 'admin' &&
    task.Project.user_id !== user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  // 🔥 CREATE LOG ก่อนลบ
  await TaskLog.create({
    task_id: task.task_id,
    action: 'DELETE',
    description: `Task deleted by ${user.name}`
  })

  await Task.destroy({
    where: { task_id: req.params.id }
  })

  res.redirect('/tasks')
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

  if (
    req.session.user.role !== 'admin' &&
    task.Project.user_id !== req.session.user.user_id
  ) {
    return res.status(403).send('Access Denied')
  }

  res.render('tasks/show', { task })
}
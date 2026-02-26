const { Task, Project, User } = require('../models')

exports.index = async (req, res) => {
  const tasks = await Task.findAll({
    include: [
      {
        model: Project,
        include: [
          {
            model: User
          }
        ]
      }
    ]
  })

  res.render('tasks/index', { tasks })
}

exports.createForm = async (req, res) => {
  const users = await User.findAll({
    include: [Project]
  })

  res.render('tasks/create', { users })
}

exports.create = async (req, res) => {
  try {
    const lastTask = await Task.findOne({
      order: [['task_id', 'DESC']]
    })

    const nextNumber = lastTask ? lastTask.task_id + 1 : 1

    const newTask = {
      ...req.body,
      title: `Task #${nextNumber}`
    }

    await Task.create(newTask)

    res.redirect('/tasks')
  } catch (error) {
    console.error(error)
    res.send(error.message)
  }
}
exports.editForm = async (req, res) => {
  const task = await Task.findByPk(req.params.id, {
    include: {
      model: Project,
      include: User
    }
  })

  const users = await User.findAll({
    include: Project
  })

  res.render('tasks/edit', { task, users })
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
    include: [
      {
        model: Project,
        include: [User]
      }
    ]
  })

  res.render('tasks/show', { task })
}
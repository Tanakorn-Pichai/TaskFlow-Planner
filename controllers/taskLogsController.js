const { TaskLog, Task, Project } = require('../models')

exports.index = async (req, res) => {
  const user = req.session.user
  let logs

  if (user.role === 'admin') {

    logs = await TaskLog.findAll({
      include: {
        model: Task,
        include: Project
      },
      order: [['created_at', 'DESC']]
    })

  } else {

    logs = await TaskLog.findAll({
      include: {
        model: Task,
        required: true,
        include: {
          model: Project,
          where: { user_id: user.user_id },
          required: true
        }
      },
      order: [['created_at', 'DESC']]
    })

  }

  res.render('task_logs/index', { logs, user })
}

exports.show = async (req, res) => {
  const log = await TaskLog.findByPk(req.params.id, {
    include: Task
  })
  res.render('task_logs/show', { log })
}
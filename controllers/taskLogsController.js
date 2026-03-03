const { TaskLog, Task, Project, User } = require('../models')


exports.index = async (req, res) => {
  const user = req.session.user
  let logs

  if (user.role === 'admin') {

    logs = await TaskLog.findAll({
      include: {
      model: Task,
      include: {
        model: Project,
        include: User
      }
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
    include: {
      model: Task,
      include: {
        model: Project,
        include: User
      }
    }
  })

  if (!log) {
    req.flash('error', 'Log not found')
    return res.redirect('/task-logs')
  }

  res.render('task_logs/show', { log })
}
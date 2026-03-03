const { User, Project, Task, Sequelize } = require('../models')
const { Op } = require('sequelize')

exports.dashboard = async (req, res) => {
  const user = req.session.user

  let totalUsers = 0
  let totalProjects = 0
  let totalTasks = 0
  let completedTasks = 0
  let pendingTasks = 0
  let completedProjects = 0
  let pendingProjects = 0

  if (user.role === 'admin') {

    totalUsers = await User.count()
    totalProjects = await Project.count()
    totalTasks = await Task.count()

    // ===== TASK =====
    completedTasks = await Task.count({
      where: { status: 'Completed' }
    })

    pendingTasks = await Task.count({
      where: { status: { [Op.ne]: 'Completed' } }
    })

    // ===== PROJECT =====
    completedProjects = await Project.count({
      where: { status: 'completed' }
    })

    pendingProjects = await Project.count({
      where: { status: { [Op.ne]: 'completed' } }
    })

  } else {

    totalProjects = await Project.count({
      where: { user_id: user.user_id }
    })

    totalTasks = await Task.count({
      include: {
        model: Project,
        where: { user_id: user.user_id },
        required: true
      }
    })

    completedTasks = await Task.count({
      where: { status: 'Completed' },
      include: {
        model: Project,
        where: { user_id: user.user_id },
        required: true
      }
    })

    pendingTasks = await Task.count({
      where: { status: { [Op.ne]: 'Completed' } },
      include: {
        model: Project,
        where: { user_id: user.user_id },
        required: true
      }
    })

    // ===== PROJECT (เฉพาะของ user) =====
    completedProjects = await Project.count({
      where: {
        user_id: user.user_id,
        status: 'completed'
      }
    })

    pendingProjects = await Project.count({
      where: {
        user_id: user.user_id,
        status: { [Op.ne]: 'completed' }
      }
    })
  }

  res.render('home', {
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
    completedProjects,
    pendingProjects,
    user
  })
}
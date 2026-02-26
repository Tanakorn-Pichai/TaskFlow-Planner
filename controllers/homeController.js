const { User, Project, Task } = require('../models')
const { Sequelize } = require('sequelize')

exports.dashboard = async (req, res) => {

  const totalUsers = await User.count()
  const totalProjects = await Project.count()
  const totalTasks = await Task.count()

  const statusSummary = await Task.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('status')), 'count']
    ],
    group: ['status']
  })

  res.render('home', {
    totalUsers,
    totalProjects,
    totalTasks,
    statusSummary
  })
}
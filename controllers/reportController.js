const { Task, TaskLog, User } = require('../models')
const { Sequelize } = require('sequelize')

exports.productivityDashboard = async (req, res) => {
  const total = await Task.count()
  const done = await Task.count({ where: { status: 'done' } })
  const pending = total - done
  const percent = total === 0 ? 0 : ((done / total) * 100).toFixed(2)

  res.render('reports/report1', { total, done, pending, percent })
}

exports.userPerformance = async (req, res) => {
  const users = await User.findAll({
    include: {
      model: require('../models').Project,
      include: require('../models').Task
    }
  })

  const performance = await TaskLog.findAll({
    attributes: [
      [Sequelize.fn('SUM', Sequelize.col('time_spent')), 'total_time']
    ]
  })

  res.render('reports/report2', { users, performance })
}
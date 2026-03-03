console.log("HOME CONTROLLER VERSION 2")
const { User, Project, Task } = require('../models')
const { Sequelize } = require('sequelize')
exports.dashboard = async (req, res) => {

  const user = req.session.user

  // ===== ADMIN =====
  if (user.role === 'admin') {

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

    return res.render('home', {
      totalUsers,
      totalProjects,
      totalTasks,
      statusSummary,
      role: user.role   // ✅ สำคัญมาก
    })
  }

  // ===== USER =====
  else {

    const totalProjects = await Project.count({
      where: { user_id: user.user_id }
    })

const totalTasks = await Task.count({
  include: [{
    model: Project,
    where: { user_id: user.user_id },
    required: true
  }]
})

const statusSummary = await Task.findAll({
  attributes: [
    'status',
    [Sequelize.fn('COUNT', Sequelize.col('Task.status')), 'count']
  ],
  include: [{
    model: Project,
    attributes: [], // 🔥 บอกว่าไม่ต้องดึง column ของ Project
    where: { user_id: user.user_id },
    required: true
  }],
  group: ['Task.status']
})

    return res.render('home', {
      totalUsers: null,
      totalProjects,
      totalTasks,
      statusSummary,
      role: user.role   // ✅ สำคัญมาก
    })
  }
}
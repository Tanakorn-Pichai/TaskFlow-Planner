const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH
})

const User = require('./User')(sequelize, DataTypes)
const Project = require('./Project')(sequelize, DataTypes)
const Task = require('./Task')(sequelize, DataTypes)
const TaskLog = require('./TaskLog')(sequelize, DataTypes)

// Relationships
User.hasMany(Project, { foreignKey: 'user_id' })
Project.belongsTo(User, { foreignKey: 'user_id' })

Project.hasMany(Task, { foreignKey: 'project_id' })
Task.belongsTo(Project, { foreignKey: 'project_id' })

Task.hasMany(TaskLog, { foreignKey: 'task_id' })
TaskLog.belongsTo(Task, { foreignKey: 'task_id' })

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  TaskLog
}
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Task', {
    task_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    priority: DataTypes.STRING,
    status: DataTypes.STRING,
    due_date: DataTypes.DATE,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'tasks', timestamps: false })
}
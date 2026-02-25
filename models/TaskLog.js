module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TaskLog', {
    log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    task_id: DataTypes.INTEGER,
    action: DataTypes.STRING,
    time_spent: DataTypes.INTEGER,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'task_logs', timestamps: false })
}
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Project', {
    project_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    project_name: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    status: DataTypes.STRING
  }, { tableName: 'projects', timestamps: false })
}
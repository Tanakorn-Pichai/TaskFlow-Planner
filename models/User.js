module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // ✅ เพิ่มตรงนี้
    role: DataTypes.STRING,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { tableName: 'users', timestamps: false })
}
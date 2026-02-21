const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// CONNECT SQLITE
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  logging: false
});


// USERS TABLE
const User = sequelize.define("users", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  role: {
    type: DataTypes.STRING,
    allowNull: false
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }

}, {
  timestamps: false
});


// PROJECTS TABLE
const Project = sequelize.define("projects", {

  project_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  project_name: {
    type: DataTypes.STRING,
    allowNull: false
  },

  start_date: {
    type: DataTypes.DATE
  },

  end_date: {
    type: DataTypes.DATE
  },

  status: {
    type: DataTypes.STRING
  }

}, {
  timestamps: false
});


// TASKS TABLE
const Task = sequelize.define("tasks", {

  task_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  project_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false
  },

  description: {
    type: DataTypes.TEXT
  },

  priority: {
    type: DataTypes.ENUM("low", "medium", "high")
  },

  status: {
    type: DataTypes.ENUM("todo", "doing", "done")
  },

  due_date: {
    type: DataTypes.DATE
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }

}, {
  timestamps: false
});


// TASK LOGS TABLE
const TaskLog = sequelize.define("task_logs", {

  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  action: {
    type: DataTypes.ENUM("create", "update", "done")
  },

  time_spent: {
    type: DataTypes.INTEGER
  },

  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }

}, {
  timestamps: false
});


// RELATIONSHIPS

// users 1:M projects
User.hasMany(Project, { foreignKey: "user_id" });
Project.belongsTo(User, { foreignKey: "user_id" });

// projects 1:M tasks
Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });

// tasks 1:M task_logs
Task.hasMany(TaskLog, { foreignKey: "task_id" });
TaskLog.belongsTo(Task, { foreignKey: "task_id" });


// SYNC DATABASE
async function initDB() {
  try {

    await sequelize.sync({ force: true });

    console.log("✅ Database created successfully!");

  } catch (err) {
    console.error("❌ Error creating database:", err);
  }
}

initDB();

// EXPORT
module.exports = {
  sequelize,
  User,
  Project,
  Task,
  TaskLog
};
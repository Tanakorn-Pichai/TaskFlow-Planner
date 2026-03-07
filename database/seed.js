const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH || path.join(__dirname, "database.sqlite"),
  logging: false
});

// ================= USERS =================
const User = sequelize.define("users", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// ================= PROJECTS =================
const Project = sequelize.define("projects", {
  project_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  project_name: { type: DataTypes.STRING, allowNull: false },
  start_date: DataTypes.DATE,
  end_date: DataTypes.DATE,
  status: DataTypes.STRING
}, { timestamps: false });

// ================= TASKS =================
const Task = sequelize.define("tasks", {
  task_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  priority: DataTypes.ENUM("low", "medium", "high"),
  status: DataTypes.ENUM("Planning", "In progress", "Completed"),
  due_date: DataTypes.DATE,
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// ================= TASK LOGS =================
const TaskLog = sequelize.define("task_logs", {
  log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false },

  action: DataTypes.ENUM(
    "CREATE",
    "UPDATE",
    "DELETE",
    "STATUS_CHANGE",
    "PRIORITY_CHANGE"
  ),

  description: DataTypes.TEXT,

  time_spent: DataTypes.INTEGER,

  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// ================= RELATIONSHIPS =================
User.hasMany(Project, { foreignKey: "user_id" });
Project.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });

Task.hasMany(TaskLog, { foreignKey: "task_id" });
TaskLog.belongsTo(Task, { foreignKey: "task_id" });

// ================= HELPER =================
function randomDate(days = 90) {
  return new Date(Date.now() - Math.random() * days * 86400000);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ================= SEED =================
async function seed() {
  await sequelize.sync({ force: true });
  console.log("Database reset complete");

// ---------------- USERS (10 คน สมจริง) ----------------
const users = await User.bulkCreate([
  {
    name: "Tanakorn Pichai",
    email: "tanakorn@taskflow.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin"
  },
  {
    name: "Mali Support",
    email: "mali@taskflow.com",
    password: await bcrypt.hash("admin123", 10),
    role: "admin"
  },
  {
    name: "Somchai Prasert",
    email: "somchai@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Suda Wong",
    email: "suda@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Anan Techakul",
    email: "anan@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Kanya Sri",
    email: "kanya@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Narin Dev",
    email: "narin@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Pimchanok UI",
    email: "pimchanok@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Thanawat QA",
    email: "thanawat@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  },
  {
    name: "Krit Backend",
    email: "krit@taskflow.com",
    password: await bcrypt.hash("1234", 10),
    role: "user"
  }
]);

  // ---------- PROJECTS (10) ----------
  const projects = [];
  for (let i = 1; i <= 10; i++) {
    projects.push({
      user_id: randomFrom(users).user_id,
      project_name: `Project ${i}`,
      start_date: randomDate(120),
      end_date: randomDate(30),
      status: randomFrom(["planning", "active", "completed"])
    });
  }

  const createdProjects = await Project.bulkCreate(projects);

  // ---------- TASKS (20) ----------
  const tasks = [];
  for (let i = 1; i <= 20; i++) {
    tasks.push({
      project_id: randomFrom(createdProjects).project_id,
      title: `Task ${i}`,
      description: `Description for task ${i}`,
      priority: randomFrom(["low", "medium", "high"]),
      status: randomFrom(["Planning", "In progress", "Completed"]),
      due_date: randomDate(60),
      created_at: randomDate(90)
    });
  }

  const createdTasks = await Task.bulkCreate(tasks);

  // ---------- TASK LOGS (40) ----------
const logs = [];
for (let i = 1; i <= 40; i++) {
  logs.push({
    task_id: randomFrom(createdTasks).task_id,
    action: randomFrom([
      "CREATE",
      "UPDATE",
      "DELETE",
      "STATUS_CHANGE",
      "PRIORITY_CHANGE"
    ]),
    description: "Auto generated log",
    time_spent: Math.floor(Math.random() * 180) + 10,
    created_at: randomDate(60)
  });
}

  await TaskLog.bulkCreate(logs);

  console.log("Seed complete!");
  console.log("Users:", await User.count());
  console.log("Projects:", await Project.count());
  console.log("Tasks:", await Task.count());
  console.log("TaskLogs:", await TaskLog.count());

  process.exit();
}

seed();
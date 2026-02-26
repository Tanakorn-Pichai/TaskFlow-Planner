const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

// ==============================
// CONNECT SQLITE
// ==============================
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "database.sqlite"),
  logging: false
});

// ==============================
// DEFINE MODELS
// ==============================

// USERS
const User = sequelize.define("users", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  role: { type: DataTypes.STRING, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// PROJECTS
const Project = sequelize.define("projects", {
  project_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  project_name: { type: DataTypes.STRING, allowNull: false },
  start_date: { type: DataTypes.DATE },
  end_date: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING }
}, { timestamps: false });

// TASKS
const Task = sequelize.define("tasks", {
  task_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  project_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM("low", "medium", "high") },
  status: { type: DataTypes.ENUM("Planning", "In progress", "Completed") },
  due_date: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// TASK LOGS
const TaskLog = sequelize.define("task_logs", {
  log_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false },
  action: { type: DataTypes.ENUM("create", "update", "done") },
  time_spent: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }
}, { timestamps: false });

// ==============================
// RELATIONSHIPS
// ==============================

User.hasMany(Project, { foreignKey: "user_id" });
Project.belongsTo(User, { foreignKey: "user_id" });

Project.hasMany(Task, { foreignKey: "project_id" });
Task.belongsTo(Project, { foreignKey: "project_id" });

Task.hasMany(TaskLog, { foreignKey: "task_id" });
TaskLog.belongsTo(Task, { foreignKey: "task_id" });

// ==============================
// SEED FUNCTION
// ==============================

function randomDate(daysBack = 90) {
  const now = new Date();
  return new Date(now.getTime() - Math.random() * daysBack * 24 * 60 * 60 * 1000);
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log("✅ Database reset complete");

    // ---------------- USERS (10) ----------------
    const users = await User.bulkCreate([
      { name: "Somchai Prasert", email: "somchai@email.com", role: "user" },
      { name: "Suda Wong", email: "suda@email.com", role: "user" },
      { name: "Anan Techakul", email: "anan@email.com", role: "user" },
      { name: "Kanya Sri", email: "kanya@email.com", role: "user" },
      { name: "Narin Dev", email: "narin@email.com", role: "user" },
      { name: "Pimchanok UI", email: "pim@email.com", role: "user" },
      { name: "Thanawat QA", email: "thanawat@email.com", role: "user" },
      { name: "Orn Project", email: "orn@email.com", role: "user" },
      { name: "Krit Backend", email: "krit@email.com", role: "user" },
      { name: "Mali Support", email: "mali@email.com", role: "admin" }
    ]);

    // ---------------- PROJECTS (12) ----------------
    const projectNames = [
      "E-commerce Platform", "Inventory System", "HR Management",
      "School Management", "Mobile Banking App", "Restaurant POS",
      "Hotel Booking System", "TaskFlow Planner", "CRM System",
      "Online Course Platform", "Customer Support Portal",
      "AI Analytics Dashboard"
    ];

    const projects = [];

    for (let i = 0; i < 12; i++) {
      projects.push({
        user_id: randomFrom(users).user_id,
        project_name: projectNames[i],
        start_date: randomDate(120),
        end_date: randomDate(30),
        status: randomFrom(["planning", "active", "completed"])
      });
    }

    const createdProjects = await Project.bulkCreate(projects);

    // ---------------- TASKS (30) ----------------
    const priorities = ["low", "medium", "high"];
    const statuses = ["Planning", "In progress", "Completed"];

    const tasks = [];

    for (let i = 0; i < 30; i++) {
      tasks.push({
        project_id: randomFrom(createdProjects).project_id,
        title: `Task #${i + 1}`,
        description: `Detailed description for task ${i + 1}`,
        priority: randomFrom(priorities),
        status: randomFrom(statuses),
        due_date: randomDate(60),
        created_at: randomDate(90)
      });
    }

    const createdTasks = await Task.bulkCreate(tasks);

    // ---------------- TASK LOGS (80) ----------------
    const actions = ["create", "update", "done"];
    const logs = [];

    for (let i = 0; i < 80; i++) {
      logs.push({
        task_id: randomFrom(createdTasks).task_id,
        action: randomFrom(actions),
        time_spent: Math.floor(Math.random() * 180) + 10,
        created_at: randomDate(60)
      });
    }

    await TaskLog.bulkCreate(logs);

    console.log("🌱 Seed data inserted successfully!");
    console.log("Users:", await User.count());
    console.log("Projects:", await Project.count());
    console.log("Tasks:", await Task.count());
    console.log("Task Logs:", await TaskLog.count());

  } catch (error) {
    console.error("❌ Seed Error:", error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
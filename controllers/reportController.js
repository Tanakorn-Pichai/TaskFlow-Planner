const { sequelize } = require("../models");
const { Task, Project, User, TaskLog } = require('../models')

exports.longestTasks = async (req, res) => {

  const tasks = await Task.findAll({
    include: [
      {
        model: Project,
        include: [User]
      },
      {
        model: TaskLog
      }
    ]
  })

  const result = tasks.map(task => {

    let totalMinutes = 0
    task.TaskLogs.forEach(log => {
      totalMinutes += log.time_spent
    })

    return {
      title: task.title,
      project: task.Project.project_name,
      owner: task.Project.User.name,
      totalMinutes,
      logCount: task.TaskLogs.length
    }
  })

  const longest = result
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
    .slice(0, 5)

  res.render('reports/report1', { longest })
}

// 🏆 Report 2: User Performance Report
exports.userPerformanceReport = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        u.user_id,
        u.name,
        COUNT(DISTINCT t.task_id) AS total_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.task_id END) AS completed_tasks,
        COALESCE(SUM(tl.time_spent), 0) AS total_time_spent,
        ROUND(
          (COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.task_id END) * 100.0) /
          NULLIF(COUNT(DISTINCT t.task_id), 0), 2
        ) AS completion_rate
      FROM users u
      LEFT JOIN projects p ON p.user_id = u.user_id
      LEFT JOIN tasks t ON t.project_id = p.project_id
      LEFT JOIN task_logs tl ON tl.task_id = t.task_id
      GROUP BY u.user_id
      ORDER BY completion_rate DESC, total_time_spent DESC
    `);

    results.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.render("reports/report2", { users: results });

  } catch (error) {
    console.error(error);
    res.send("Error generating report");
  }
};
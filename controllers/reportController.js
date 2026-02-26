const { sequelize } = require("../models");

exports.productivityDashboard = async (req, res) => {
  try {

    const { start_date, end_date } = req.query;

    let condition = "";
    if (start_date && end_date) {
      condition = `
        WHERE date(created_at) BETWEEN '${start_date}' AND '${end_date}'
      `;
    }

    const [result] = await sequelize.query(`
      SELECT 
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN status != 'done' THEN 1 ELSE 0 END) AS pending_tasks
      FROM tasks
      ${condition}
    `);

    const data = result[0];

    const completion_rate = data.total_tasks > 0
      ? ((data.completed_tasks / data.total_tasks) * 100).toFixed(2)
      : 0;

    res.render("reports/report1", {
      total: data.total_tasks,
      completed: data.completed_tasks,
      pending: data.pending_tasks,
      rate: completion_rate,
      start_date,
      end_date
    });

  } catch (err) {
    console.error(err);
    res.send("Error generating dashboard");
  }
};


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
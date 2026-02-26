const { User, Project, Task, TaskLog } = require("../models");
const { fn, col, literal } = require("sequelize");

/* ===============================
   REPORT 1: Longest Tasks
=================================*/
exports.longestTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: Project,
          include: [User],
        },
        {
          model: TaskLog,
        },
      ],
    });

    const result = tasks.map((task) => {
      let totalMinutes = 0;

      task.TaskLogs.forEach((log) => {
        totalMinutes += log.time_spent || 0;
      });

      return {
        title: task.title,
        project: task.Project?.project_name || "-",
        owner: task.Project?.User?.name || "-",
        totalMinutes,
        logCount: task.TaskLogs.length,
      };
    });

    const longest = result
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 5);

    res.render("reports/report1", { longest });
  } catch (error) {
    console.error(error);
    res.send("Error generating longest task report");
  }
};

/* ===============================
   REPORT 2: User Performance
=================================*/
exports.userPerformanceReport = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "user_id",
        "name",

        // จำนวนโปรเจค
        [
          fn("COUNT", fn("DISTINCT", col("Projects.project_id"))),
          "total_projects",
        ],

        // จำนวนงานทั้งหมด
        [
          fn("COUNT", fn("DISTINCT", col("Projects->Tasks.task_id"))),
          "total_tasks",
        ],

        // จำนวนงานที่เสร็จ
        [
          fn(
            "COUNT",
            literal(`DISTINCT CASE 
              WHEN \`Projects->Tasks\`.\`status\` = 'Completed'
              THEN \`Projects->Tasks\`.\`task_id\`
            END`)
          ),
          "completed_tasks",
        ],

        // เวลารวมทั้งหมด (กัน NULL)
        [
          fn(
            "COALESCE",
            fn("SUM", col("Projects->Tasks->TaskLogs.time_spent")),
            0
          ),
          "total_time_spent",
        ],
      ],

      include: [
        {
          model: Project,
          attributes: [],
          include: [
            {
              model: Task,
              attributes: [],
              include: [
                {
                  model: TaskLog,
                  attributes: [],
                },
              ],
            },
          ],
        },
      ],

      group: ["User.user_id", "User.name"], // สำคัญมาก
      raw: true,
    });

    // 🔥 แปลงค่า + คำนวณเปอร์เซ็นต์
    const formatted = users.map((u) => {
      const totalProjects = Number(u.total_projects) || 0;
      const totalTasks = Number(u.total_tasks) || 0;
      const completedTasks = Number(u.completed_tasks) || 0;
      const totalTime = Number(u.total_time_spent) || 0;

      const completionRate =
        totalTasks > 0
          ? (completedTasks / totalTasks) * 100
          : 0;

      return {
        user_id: u.user_id,
        name: u.name,
        total_projects: totalProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_time_spent: totalTime,
        completion_rate: Number(completionRate.toFixed(1)), // บังคับเป็น number
      };
    });

    // 🔥 เรียงอันดับ (เปอร์เซ็นต์ > เวลารวม > จำนวนงาน)
    formatted.sort((a, b) => {
      if (b.completion_rate !== a.completion_rate)
        return b.completion_rate - a.completion_rate;

      if (b.total_time_spent !== a.total_time_spent)
        return b.total_time_spent - a.total_time_spent;

      return b.total_tasks - a.total_tasks;
    });

    // 🔥 ใส่ Rank
    formatted.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.render("reports/report2", { users: formatted });

  } catch (error) {
    console.error(error);
    res.send("Error generating report");
  }
};
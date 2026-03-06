const { User, Project, Task, TaskLog } = require("../models");
const { fn, col, literal } = require("sequelize");

/* ===============================
   API REPORT 1: Longest Tasks
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
        totalHours: totalMinutes,
        logCount: task.TaskLogs.length,
      };
    });

    const longest = result
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);

    res.json({ success: true, report: 'longest_tasks', data: longest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating longest task report" });
  }
};

/* ===============================
   API REPORT 2: User Performance
=================================*/
exports.userPerformance = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Project,
          include: [
            {
              model: Task,
              include: [TaskLog],
            },
          ],
        },
      ],
    });

    const result = users.map((user) => {
      let totalTasks = 0;
      let completedTasks = 0;
      let totalHours = 0;

      user.Projects.forEach((project) => {
        project.Tasks.forEach((task) => {
          totalTasks++;
          if (task.status === "completed") {
            completedTasks++;
          }
          task.TaskLogs.forEach((log) => {
            totalHours += log.hours_worked || 0;
          });
        });
      });

      return {
        name: user.name,
        email: user.email,
        totalTasks,
        completedTasks,
        totalHours,
        completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0,
      };
    });

    res.json({ success: true, report: 'user_performance', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating user performance report" });
  }
};
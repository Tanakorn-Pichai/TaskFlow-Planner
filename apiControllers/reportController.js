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

    // 🔥 Calculate stats for each user
    const result = users.map((user) => {
      const projects = user.Projects || [];
      const tasks = projects.flatMap((p) => p.Tasks || []);
      const taskLogs = tasks.flatMap((t) => t.TaskLogs || []);

      const totalProjects = projects.length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "Completed").length;
      const totalTimeSpent = taskLogs.reduce((sum, log) => sum + (log.time_spent || 0), 0);

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        total_projects: totalProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_time_spent: totalTimeSpent,
        completion_rate: Number(completionRate.toFixed(1)),
      };
    });

    // 🔥 Sort by rank (completion % > total time > number of tasks)
    result.sort((a, b) => {
      if (b.completion_rate !== a.completion_rate)
        return b.completion_rate - a.completion_rate;

      if (b.total_time_spent !== a.total_time_spent)
        return b.total_time_spent - a.total_time_spent;

      return b.total_tasks - a.total_tasks;
    });

    // 🔥 Add rank
    result.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.json({ success: true, report: 'user_performance', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating user performance report" });
  }
};
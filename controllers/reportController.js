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

    // compute a simple summary for the top‑5 list
    const summary = {
      totalTime: longest.reduce((sum, t) => sum + t.totalMinutes, 0),
      totalLogs: longest.reduce((sum, t) => sum + t.logCount, 0),
      averageTime: longest.length > 0 ? (longest.reduce((sum, t) => sum + t.totalMinutes, 0) / longest.length).toFixed(2) : 0,
    };

    res.render("reports/report1", { longest, summary });
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
    // Get the current user from session
    const currentUser = req.session.user;

    // Fetch all users with their projects and tasks
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
    const formatted = users.map((user) => {
      // Sequelize returns associations with capitalized names by default
      const projects = user.projects || user.Projects || [];
      const tasks = projects.flatMap((p) => p.tasks || p.Tasks || []);
      const taskLogs = tasks.flatMap((t) => t.taskLogs || t.TaskLogs || []);

      const totalProjects = projects.length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "Completed").length;
      const totalTime = taskLogs.reduce((sum, log) => sum + (log.time_spent || 0), 0);

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        user_id: user.user_id,
        name: user.name,
        total_projects: totalProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_time_spent: totalTime,
        completion_rate: Number(completionRate.toFixed(1)),
      };
    });

    // 🔥 Sort by rank (completion % > total time > number of tasks)
    formatted.sort((a, b) => {
      if (b.completion_rate !== a.completion_rate)
        return b.completion_rate - a.completion_rate;

      if (b.total_time_spent !== a.total_time_spent)
        return b.total_time_spent - a.total_time_spent;

      return b.total_tasks - a.total_tasks;
    });

    // 🔥 Add rank
    formatted.forEach((user, index) => {
      user.rank = index + 1;
    });

    res.render("reports/report2", { users: formatted, user: currentUser });

  } catch (error) {
    console.error(error);
    res.render("reports/report2", { users: [], user: req.session.user, error: "Error generating report" });
  }
};
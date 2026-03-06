const { Task, Project, User, TaskLog } = require('../models')

// =============================
// API LIST TASKS
// =============================
exports.index = async (req, res) => {
  try {
    const { user_id } = req.query;
    const where = {};
    const includeUser = {
      model: User,
      attributes: ['user_id', 'name', 'email'],
    };

    // if filtering by user, we will constrain via Project.user_id
    const projectInclude = {
      model: Project,
      include: [includeUser],
    };
    if (user_id) {
      projectInclude.where = { user_id };
    }

    const tasks = await Task.findAll({
      include: [projectInclude],
      where,
    });

    res.json({ success: true, tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
}

// =============================
// API GET TASK BY ID
// =============================
exports.show = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [{
        model: Project,
        include: [{
          model: User,
          attributes: ['user_id', 'name', 'email'],
        }],
      }, {
        model: TaskLog,
      }],
    })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (req.query.user_id && task.Project && task.Project.user_id.toString() !== req.query.user_id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ success: true, task })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load task' })
  }
}

// =============================
// API CREATE TASK
// =============================
exports.create = async (req, res) => {
  try {
    const { title, description, status, priority, project_id, due_date } = req.body

    if (req.query.user_id) {
      // ensure the referenced project belongs to this user
      const project = await Project.findByPk(project_id);
      if (project && project.user_id.toString() !== req.query.user_id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const newTask = await Task.create({
      title,
      description,
      status,
      priority,
      project_id,
      due_date
    })

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: newTask
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create task' })
  }
}

// =============================
// API UPDATE TASK
// =============================
exports.update = async (req, res) => {
  try {
    const { title, description, status, priority, project_id, due_date } = req.body
    const task = await Task.findByPk(req.params.id)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    // ensure user doesn't update task from another project if user_id filter provided
    if (req.query.user_id) {
      const project = await Project.findByPk(task.project_id);
      if (project && project.user_id.toString() !== req.query.user_id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    await task.update({
      title,
      description,
      status,
      priority,
      project_id,
      due_date
    })

    res.json({
      success: true,
      message: 'Task updated successfully',
      task
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update task' })
  }
}

// =============================
// API DELETE TASK
// =============================
exports.delete = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (req.query.user_id) {
      const project = await Project.findByPk(task.project_id);
      if (project && project.user_id.toString() !== req.query.user_id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    await task.destroy()
    res.json({ success: true, message: 'Task deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete task' })
  }
}
const { Task, Project, User, TaskLog } = require('../models')

// =============================
// API LIST TASKS
// =============================
exports.index = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{
        model: Project,
        include: [{
          model: User,
          attributes: ['user_id', 'name', 'email']
        }]
      }]
    })

    res.json({ success: true, tasks })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load tasks' })
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
          attributes: ['user_id', 'name', 'email']
        }]
      }, {
        model: TaskLog
      }]
    })

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
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

    await task.destroy()
    res.json({ success: true, message: 'Task deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete task' })
  }
}
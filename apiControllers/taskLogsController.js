const { TaskLog, Task, Project, User } = require('../models')

// =============================
// API LIST TASK LOGS
// =============================
exports.index = async (req, res) => {
  try {
    const taskLogs = await TaskLog.findAll({
      include: [{
        model: Task,
        include: [{
          model: Project,
          include: [{
            model: User,
            attributes: ['user_id', 'name', 'email']
          }]
        }]
      }]
    })

    res.json({ success: true, taskLogs })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load task logs' })
  }
}

// =============================
// API GET TASK LOG BY ID
// =============================
exports.show = async (req, res) => {
  try {
    const taskLog = await TaskLog.findByPk(req.params.id, {
      include: [{
        model: Task
      }]
    })

    if (!taskLog) {
      return res.status(404).json({ error: 'Task log not found' })
    }

    res.json({ success: true, taskLog })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load task log' })
  }
}

// =============================
// API CREATE TASK LOG
// =============================
exports.create = async (req, res) => {
  try {
    const { task_id, log_date, time_spent, description } = req.body

    const newTaskLog = await TaskLog.create({
      task_id,
      log_date,
      time_spent,
      description
    })

    res.status(201).json({
      success: true,
      message: 'Task log created successfully',
      taskLog: newTaskLog
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create task log' })
  }
}

// =============================
// API UPDATE TASK LOG
// =============================
exports.update = async (req, res) => {
  try {
    const { task_id, log_date, time_spent, description } = req.body
    const taskLog = await TaskLog.findByPk(req.params.id)

    if (!taskLog) {
      return res.status(404).json({ error: 'Task log not found' })
    }

    await taskLog.update({
      task_id,
      log_date,
      time_spent,
      description
    })

    res.json({
      success: true,
      message: 'Task log updated successfully',
      taskLog
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update task log' })
  }
}

// =============================
// API DELETE TASK LOG
// =============================
exports.delete = async (req, res) => {
  try {
    const taskLog = await TaskLog.findByPk(req.params.id)

    if (!taskLog) {
      return res.status(404).json({ error: 'Task log not found' })
    }

    await taskLog.destroy()
    res.json({ success: true, message: 'Task log deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete task log' })
  }
}
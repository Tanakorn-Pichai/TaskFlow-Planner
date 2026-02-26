const { TaskLog, Task } = require('../models')

exports.index = async (req, res) => {
  const logs = await TaskLog.findAll({ include: Task })
  res.render('task_logs/index', { logs })
}

exports.createForm = async (req, res) => {
  const tasks = await Task.findAll()
  res.render('task_logs/create', { tasks })
}

exports.create = async (req, res) => {
  const { task_id, action } = req.body

  // ถ้าเป็น update (เริ่มทำงาน)
  if (action === "update") {
    await TaskLog.create({
      task_id,
      action: "update",
      time_spent: 0
    })
  }

  // ถ้าเป็น done (จบงาน → คำนวณเวลา)
  if (action === "done") {

    // หา log ล่าสุดที่เป็น update
    const lastUpdateLog = await TaskLog.findOne({
      where: {
        task_id,
        action: "update"
      },
      order: [["created_at", "DESC"]]
    })

    let minutes = 0

    if (lastUpdateLog) {
      const startTime = new Date(lastUpdateLog.created_at)
      const endTime = new Date()
      minutes = Math.floor((endTime - startTime) / 60000)
    }

    await TaskLog.create({
      task_id,
      action: "done",
      time_spent: minutes
    })
  }

  // ถ้าเป็น create ธรรมดา
  if (action === "create") {
    await TaskLog.create({
      task_id,
      action: "create",
      time_spent: 0
    })
  }

  res.redirect('/task-logs')
}

exports.delete = async (req, res) => {
  await TaskLog.destroy({ where: { log_id: req.params.id } })
  res.redirect('/task-logs')
}

exports.show = async (req, res) => {
  const log = await TaskLog.findByPk(req.params.id, {
    include: Task
  })
  res.render('task_logs/show', { log })
}
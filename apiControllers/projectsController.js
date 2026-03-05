const { Project, User } = require('../models')

// =============================
// API LIST PROJECTS
// =============================
exports.index = async (req, res) => {
  try {
    // For API, we'll assume user info comes from auth middleware or headers
    // For now, return all projects (in production, add proper auth)
    const projects = await Project.findAll({
      include: [{
        model: User,
        attributes: ['user_id', 'name', 'email']
      }]
    })

    res.json({ success: true, projects })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load projects' })
  }
}

// =============================
// API GET PROJECT BY ID
// =============================
exports.show = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['user_id', 'name', 'email']
      }]
    })

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    res.json({ success: true, project })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load project' })
  }
}

// =============================
// API CREATE PROJECT
// =============================
exports.create = async (req, res) => {
  try {
    const { project_name, start_date, end_date, status, user_id } = req.body

    const newProject = await Project.create({
      project_name,
      start_date,
      end_date,
      status,
      user_id
    })

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: newProject
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create project' })
  }
}

// =============================
// API UPDATE PROJECT
// =============================
exports.update = async (req, res) => {
  try {
    const { project_name, start_date, end_date, status, user_id } = req.body
    const project = await Project.findByPk(req.params.id)

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    await project.update({
      project_name,
      start_date,
      end_date,
      status,
      user_id
    })

    res.json({
      success: true,
      message: 'Project updated successfully',
      project
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update project' })
  }
}

// =============================
// API DELETE PROJECT
// =============================
exports.delete = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id)

    if (!project) {
      return res.status(404).json({ error: 'Project not found' })
    }

    await project.destroy()
    res.json({ success: true, message: 'Project deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
}
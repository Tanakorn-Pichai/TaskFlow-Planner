const { Project, User } = require('../models')

// =============================
// API LIST PROJECTS
// =============================
exports.index = async (req, res) => {
  try {
    // For API, we'll assume user info comes from auth middleware or headers
    // Allow filtering by owner when the frontend passes user_id as a query parameter.
    // Example: GET /projects?user_id=123
    const { user_id } = req.query;
    const where = {};
    if (user_id) {
      // only return projects that belong to this user
      where.user_id = user_id;
    }

    const projects = await Project.findAll({
      where,
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

    // enforce ownership if user_id provided
    if (req.query.user_id && project.user_id.toString() !== req.query.user_id) {
      return res.status(403).json({ error: 'Access denied' })
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

    // note: frontend already attaches correct user_id (current user for non-admin)
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

    // enforce ownership if user is trying to modify another user's project
    if (req.query.user_id && project.user_id.toString() !== req.query.user_id) {
      return res.status(403).json({ error: 'Access denied' })
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

    if (req.query.user_id && project.user_id.toString() !== req.query.user_id) {
      return res.status(403).json({ error: 'Access denied' })
    }

    await project.destroy()
    res.json({ success: true, message: 'Project deleted successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete project' })
  }
}
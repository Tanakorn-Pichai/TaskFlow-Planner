require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { sequelize } = require('./models')
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api/auth', require('./apiRoutes/authRoutes'))
app.use('/api/users', require('./apiRoutes/usersRoutes'))
app.use('/api/projects', require('./apiRoutes/projectsRoutes'))
app.use('/api/tasks', require('./apiRoutes/tasksRoutes'))
app.use('/api/task-logs', require('./apiRoutes/taskLogsRoutes'))
app.use('/api/reports', require('./apiRoutes/reportRoutes'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend API running' })
})

sequelize.sync().then(() => {
  const PORT = process.env.BACKEND_PORT || 3000
  app.listen(PORT, () => {
    console.log(`Backend API running on http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('Database sync error:', err)
})
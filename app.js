require('dotenv').config()
const express = require('express')
const path = require('path')
const session = require('express-session')
const axios = require('axios')
const flash = require('connect-flash')
const methodOverride = require('method-override')

const app = express()

// Configure view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'))
app.use(flash())

// Session configuration
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}))

// Flash messages middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  res.locals.user = req.session.user
  next()
})

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/api'

// Auth middleware
function isAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
}

function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/')
  }
  next()
}

function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.status(403).send('Access Denied')
  }
  next()
}

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.redirect('/login')
  })
})

// Auth routes
app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', req.body)
    console.log('BACKEND_URL:', BACKEND_URL)
    const response = await axios.post(`${BACKEND_URL}/auth/login`, req.body, { timeout: 5000 })
    console.log('Login response:', response.data)
    const { user } = response.data

    // Store user in session
    req.session.user = user
    req.flash('success', 'Login successful!')
    res.redirect('/')
  } catch (error) {
    console.error('Login error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    })
    const errorMessage = error.code === 'ECONNREFUSED' ? 'Cannot connect to server' : (error.response?.data?.error || 'Login failed')
    req.flash('error', errorMessage)
    res.redirect('/login')
  }
})

app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/auth/register`, req.body)

    req.flash('success', 'Registration successful! Please login.')
    res.redirect('/login')
  } catch (error) {
    console.error('Registration error:', error.message)
    const errorMessage = error.response?.data?.error || 'Registration failed'
    req.flash('error', errorMessage)
    res.redirect('/register')
  }
})

// Frontend Routes
app.get('/', isAuth, async (req, res) => {
  try {
    // Get stats for dashboard
    const [usersRes, projectsRes, tasksRes, logsRes] = await Promise.all([
      req.session.user.role === 'admin' ? axios.get(`${BACKEND_URL}/users`) : Promise.resolve({ data: { users: [] } }),
      axios.get(`${BACKEND_URL}/projects`),
      axios.get(`${BACKEND_URL}/tasks`),
      axios.get(`${BACKEND_URL}/task-logs`)
    ])

    const totalUsers = usersRes.data.users ? usersRes.data.users.length : 0
    const totalProjects = projectsRes.data.projects ? projectsRes.data.projects.length : 0
    const totalTasks = tasksRes.data.tasks ? tasksRes.data.tasks.length : 0
    const logs = logsRes.data.taskLogs ? logsRes.data.taskLogs.slice(0, 5) : []

    // Calculate completed and pending tasks
    const tasks = tasksRes.data.tasks || []
    const completedTasks = tasks.filter(task => task.status === 'Completed' || task.status === 'completed').length
    const pendingTasks = totalTasks - completedTasks

    // Calculate completed and pending projects
    const projects = projectsRes.data.projects || []
    const completedProjects = projects.filter(project => project.status === 'Completed' || project.status === 'completed').length
    const pendingProjects = totalProjects - completedProjects

    res.render('home', {
      user: req.session.user,
      totalUsers,
      totalProjects,
      totalTasks,
      logs,
      completedTasks,
      pendingTasks,
      completedProjects,
      pendingProjects
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error.message)
    res.render('home', {
      user: req.session.user,
      totalUsers: 0,
      totalProjects: 0,
      totalTasks: 0,
      logs: [],
      completedTasks: 0,
      pendingTasks: 0,
      completedProjects: 0,
      pendingProjects: 0
    })
  }
})

// Users routes
app.get('/users', isAuth, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/users`)
    const users = response.data.users || []
    res.render('users/index', { users, user: req.session.user })
  } catch (error) {
    console.error('Error fetching users:', error.message)
    req.flash('error', 'Failed to load users')
    res.render('users/index', { users: [], user: req.session.user })
  }
})

app.get('/users/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/users/${req.params.id}`)
    const user = response.data.user
    res.render('users/show', { user: user, currentUser: req.session.user })
  } catch (error) {
    console.error('Error fetching user:', error.message)
    req.flash('error', 'User not found')
    res.redirect('/users')
  }
})

app.get('/users/:id/edit', isAuth, isAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/users/${req.params.id}`)
    const user = response.data.user
    res.render('users/edit', { user: user, currentUser: req.session.user })
  } catch (error) {
    console.error('Error fetching user:', error.message)
    req.flash('error', 'User not found')
    res.redirect('/users')
  }
})

app.get('/users/create', isAuth, isAdmin, (req, res) => {
  res.render('users/create', { user: req.session.user })
})

// Users CRUD operations
app.post('/users', isAuth, isAdmin, async (req, res) => {
  try {
    await axios.post(`${BACKEND_URL}/users`, req.body)
    req.flash('success', 'User created successfully')
    res.redirect('/users')
  } catch (error) {
    console.error('Error creating user:', error.message)
    const errorMessage = error.response?.data?.error || 'Failed to create user'
    req.flash('error', errorMessage)
    res.redirect('/users/create')
  }
})

app.put('/users/:id', isAuth, isAdmin, async (req, res) => {
  try {
    await axios.put(`${BACKEND_URL}/users/${req.params.id}`, req.body)
    req.flash('success', 'User updated successfully')
    res.redirect('/users')
  } catch (error) {
    console.error('Error updating user:', error.message)
    const errorMessage = error.response?.data?.error || 'Failed to update user'
    req.flash('error', errorMessage)
    res.redirect(`/users/${req.params.id}/edit`)
  }
})

app.delete('/users/:id', isAuth, isAdmin, async (req, res) => {
  try {
    await axios.delete(`${BACKEND_URL}/users/${req.params.id}`)
    req.flash('success', 'User deleted successfully')
    res.redirect('/users')
  } catch (error) {
    console.error('Error deleting user:', error.message)
    req.flash('error', 'Failed to delete user')
    res.redirect('/users')
  }
})

// Projects routes
app.get('/projects', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/projects`)
    const projects = response.data.projects || []
    res.render('projects/index', { projects, user: req.session.user })
  } catch (error) {
    console.error('Error fetching projects:', error.message)
    req.flash('error', 'Failed to load projects')
    res.render('projects/index', { projects: [], user: req.session.user })
  }
})

app.get('/projects/:id', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/projects/${req.params.id}`)
    const project = response.data.project
    res.render('projects/show', { project, user: req.session.user })
  } catch (error) {
    console.error('Error fetching project:', error.message)
    req.flash('error', 'Project not found')
    res.redirect('/projects')
  }
})

app.get('/projects/:id/edit', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/projects/${req.params.id}`)
    const project = response.data.project
    res.render('projects/edit', { project, user: req.session.user })
  } catch (error) {
    console.error('Error fetching project:', error.message)
    req.flash('error', 'Project not found')
    res.redirect('/projects')
  }
})

app.get('/projects/create', isAuth, (req, res) => {
  res.render('projects/create')
})

// Tasks routes
app.get('/tasks', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/tasks`)
    const tasks = response.data.tasks || []
    res.render('tasks/index', { tasks, user: req.session.user })
  } catch (error) {
    console.error('Error fetching tasks:', error.message)
    req.flash('error', 'Failed to load tasks')
    res.render('tasks/index', { tasks: [], user: req.session.user })
  }
})

app.get('/tasks/:id', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/tasks/${req.params.id}`)
    const task = response.data.task
    res.render('tasks/show', { task, user: req.session.user })
  } catch (error) {
    console.error('Error fetching task:', error.message)
    req.flash('error', 'Task not found')
    res.redirect('/tasks')
  }
})

app.get('/tasks/:id/edit', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/tasks/${req.params.id}`)
    const task = response.data.task
    res.render('tasks/edit', { task, user: req.session.user })
  } catch (error) {
    console.error('Error fetching task:', error.message)
    req.flash('error', 'Task not found')
    res.redirect('/tasks')
  }
})

app.get('/tasks/create', isAuth, (req, res) => {
  res.render('tasks/create')
})

// Task Logs routes
app.get('/task-logs', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/task-logs`)
    const taskLogs = response.data.taskLogs || []
    res.render('task_logs/index', { taskLogs, user: req.session.user })
  } catch (error) {
    console.error('Error fetching task logs:', error.message)
    req.flash('error', 'Failed to load task logs')
    res.render('task_logs/index', { taskLogs: [], user: req.session.user })
  }
})

app.get('/task-logs/:id', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/task-logs/${req.params.id}`)
    const taskLog = response.data.taskLog
    res.render('task_logs/show', { taskLog, user: req.session.user })
  } catch (error) {
    console.error('Error fetching task log:', error.message)
    req.flash('error', 'Task log not found')
    res.redirect('/task-logs')
  }
})

// Reports routes
app.get('/reports', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/reports/longest-tasks`)
    const longest = response.data.data || []
    res.render('reports/report1', { longest, user: req.session.user })
  } catch (error) {
    console.error('Error fetching report:', error.message)
    req.flash('error', 'Failed to load report')
    res.render('reports/report1', { longest: [], user: req.session.user })
  }
})

app.get('/reports/report2', isAuth, async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/reports/user-performance`)
    const result = response.data.data || []
    res.render('reports/report2', { result, user: req.session.user })
  } catch (error) {
    console.error('Error fetching report:', error.message)
    req.flash('error', 'Failed to load report')
    res.render('reports/report2', { result: [], user: req.session.user })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Frontend running' })
})

const PORT = process.env.FRONTEND_PORT || 5000
app.listen(PORT, () => {
  console.log(`Frontend running on http://localhost:${PORT}`)
})
console.log('Access the application at: http://localhost:5000')
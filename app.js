require('dotenv').config()
const express = require('express')
const path = require('path')
const { sequelize } = require('./models')
const homeController = require('./controllers/homeController')

const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/users', require('./routes/usersRoutes'))
app.use('/projects', require('./routes/projectsRoutes'))
app.use('/tasks', require('./routes/tasksRoutes'))
app.use('/task-logs', require('./routes/taskLogsRoutes'))
app.use('/reports', require('./routes/reportRoutes'))

app.get('/', homeController.dashboard)

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port http://localhost:${process.env.PORT}`)
  })
})
require('dotenv').config()
const express = require('express')
const path = require('path')
const session = require('express-session')
const { sequelize } = require('./models')
const homeController = require('./controllers/homeController')
const app = express()
const flash = require('connect-flash');

app.use(flash());

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}))


app.use((req, res, next) => {
  res.locals.success = req.flash('success')
  res.locals.error = req.flash('error')
  res.locals.user = req.session.user
  next()
})


app.use('/', require('./routes/authRoutes'))


// ต้อง login ก่อน
function isAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login')
  }
  next()
}

// ต้องเป็น admin เท่านั้น
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return  res.redirect('/')
  }
  next()
}

// เฉพาะ user ธรรมดา
function isUser(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'user') {
    return res.status(403).send('Access Denied')
  }
  next()
}

app.get('/', isAuth, homeController.dashboard)

app.use('/users', isAuth, isAdmin, require('./routes/usersRoutes'))
app.use('/projects', isAuth, require('./routes/projectsRoutes'))
app.use('/tasks', isAuth, require('./routes/tasksRoutes'))
app.use('/task-logs', isAuth, require('./routes/taskLogsRoutes'))
app.use('/reports', isAuth, require('./routes/reportRoutes'))


sequelize.sync().then(() => {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
})
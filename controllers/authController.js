const bcrypt = require('bcrypt')
const { User } = require('../models')

// =============================
// แสดงหน้า Login
// =============================
exports.loginForm = (req, res) => {
  // ถ้า login แล้ว ไม่ต้องเข้า login อีก
  if (req.session.user) {
    return res.redirect('/')
  }

  res.render('login')
}

// =============================
// ทำการ Login
// =============================
exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.render('login', { error: 'Email ไม่ถูกต้อง' })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.render('login', { error: 'Password ไม่ถูกต้อง' })
    }

    // เก็บ session
    req.session.user = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    res.redirect('/')

  } catch (err) {
    console.error(err)
    res.send('Login Error')
  }
}

// =============================
// Logout
// =============================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
}
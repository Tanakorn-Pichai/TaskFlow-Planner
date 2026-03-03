const bcrypt = require('bcrypt')
const { User } = require('../models')

// =============================
// แสดงหน้า Login
// =============================
exports.loginForm = (req, res) => {
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
      req.flash('error', 'Email ไม่ถูกต้อง')
      return res.redirect('/login')
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      req.flash('error', 'Password ไม่ถูกต้อง')
      return res.redirect('/login')
    }

    // เก็บ session
    req.session.user = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    req.flash('success', 'Login สำเร็จ 🎉')
    res.redirect('/')

  } catch (err) {
    console.error(err)
    req.flash('error', 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
    res.redirect('/login')
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
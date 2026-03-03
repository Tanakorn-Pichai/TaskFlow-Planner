const bcrypt = require("bcrypt");
const { User } = require("../models");

// =============================
// แสดงหน้า Login
// =============================
exports.loginForm = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("login");
};

// =============================
// ทำการ Login
// =============================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      req.flash("error", "Email ไม่ถูกต้อง");
      return res.redirect("/login");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.flash("error", "Password ไม่ถูกต้อง");
      return res.redirect("/login");
    }

    // เก็บ session
    req.session.user = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash("success", "Login สำเร็จ 🎉");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    res.redirect("/login");
  }
};
exports.registerForm = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("register");
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    // 🔎 เช็คก่อนเลย
    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      req.flash('error', 'Email นี้ถูกใช้งานแล้ว')
      return res.redirect('/register')
    }

    const existingName = await User.findOne({ where: { name } })
    if (existingName) {
      req.flash('error', 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว')
      return res.redirect('/register')
    }

    const hashed = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashed,
      role: 'user'
    })

    req.flash('success', 'สมัครสมาชิกสำเร็จ 🎉 กรุณาเข้าสู่ระบบ')
    res.redirect('/login')

  } catch (err) {
    console.error(err)
    req.flash('error', 'เกิดข้อผิดพลาดในการสมัครสมาชิก')
    res.redirect('/register')
  }
};
// =============================
// Logout
// =============================
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid')
    res.redirect('/login')
  })
}

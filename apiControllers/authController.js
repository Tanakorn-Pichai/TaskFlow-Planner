const bcrypt = require("bcrypt");
const { User } = require("../models");

// =============================
// API LOGIN
// =============================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Email ไม่ถูกต้อง" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Password ไม่ถูกต้อง" });
    }

    // Return user data (without password)
    const userData = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ success: true, message: "Login สำเร็จ", user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  }
};

// =============================
// API REGISTER
// =============================
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 🔎 เช็คก่อนเลย
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ error: "Email นี้ถูกใช้งานแล้ว" });
    }

    const existingName = await User.findOne({ where: { name } });
    if (existingName) {
      return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
    });

    res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

// =============================
// API LOGOUT
// =============================
exports.logout = (req, res) => {
  // For API, logout is handled on frontend by clearing session/token
  res.json({ success: true, message: "Logged out successfully" });
};
const { User } = require('../models')

// =============================
// API LIST USERS
// =============================
exports.index = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Don't send passwords
    })
    res.json({ success: true, users })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load users' })
  }
}

// =============================
// API GET USER BY ID
// =============================
exports.show = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ success: true, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load user' })
  }
}

// =============================
// API CREATE USER
// =============================
exports.create = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' })
    }

    const bcrypt = require('bcrypt')
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    })

    // Return user without password
    const userResponse = {
      user_id: newUser.user_id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }

    res.status(201).json({ success: true, message: 'User created successfully', user: userResponse })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create user' })
  }
}

// =============================
// API UPDATE USER
// =============================
exports.update = async (req, res) => {
  try {
    const { name, email, role } = req.body
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if email is being changed and already exists
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' })
      }
    }

    await user.update({ name, email, role })

    const userResponse = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    res.json({ success: true, message: 'User updated successfully', user: userResponse })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

// =============================
// API DELETE USER
// =============================
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await user.destroy()
    res.json({ success: true, message: 'User deleted successfully' })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
}
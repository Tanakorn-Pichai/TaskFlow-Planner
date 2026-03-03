const { User } = require('../models')

// =============================
// LIST USERS
// =============================
exports.index = async (req, res) => {
  try {
    const users = await User.findAll()
    res.render('users/index', { users })
  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to load users')
    res.redirect('/')
  }
}

// =============================
// CREATE FORM
// =============================
exports.createForm = (req, res) => {
  res.render('users/create')
}

// =============================
// CREATE USER
// =============================
exports.create = async (req, res) => {
  try {
    await User.create(req.body)

    req.flash('success', 'User created successfully 🎉')
    res.redirect('/users')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to create user')
    res.redirect('/users/create')
  }
}

// =============================
// EDIT FORM
// =============================
exports.editForm = async (req, res) => {
  const user = await User.findByPk(req.params.id)

  if (!user) {
    req.flash('error', 'User not found')
    return res.redirect('/users')
  }

  res.render('users/edit', { user })
}

// =============================
// UPDATE USER
// =============================
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/users')
    }

    await user.update(req.body)

    req.flash('success', 'User updated successfully ✅')
    res.redirect('/users')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to update user')
    res.redirect('/users')
  }
}

// =============================
// DELETE USER
// =============================
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id)

    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/users')
    }

    await user.destroy()

    req.flash('success', 'User deleted successfully 🗑️')
    res.redirect('/users')

  } catch (err) {
    console.error(err)
    req.flash('error', 'Failed to delete user')
    res.redirect('/users')
  }
}

// =============================
// SHOW USER
// =============================
exports.show = async (req, res) => {
  const user = await User.findByPk(req.params.id)

  if (!user) {
    req.flash('error', 'User not found')
    return res.redirect('/users')
  }

  res.render('users/show', { user })
}
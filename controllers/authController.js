const { User } = require('../models')
const bcrypt = require('bcrypt')

exports.showLogin = (req, res) => {
  res.render('login')
}

exports.login = async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({
    where: { name: username }
  })

  if (!user) {
    return res.send('User not found')
  }

  const match = await bcrypt.compare(password, user.password)

  if (!match) {
    return res.send('Wrong password')
  }

  req.session.user = {
    id: user.user_id,
    name: user.name
  }

  res.redirect('/')
}

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login')
  })
}
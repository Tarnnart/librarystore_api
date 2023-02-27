const express = require('express')
const user = require('../controller/user.controller')

const router = express.Router()

router.route('/register')
  .post(user.register)

router.route('/login')
  .post(user.login)

router.route('/history')
  .post(user.history)

module.exports = router

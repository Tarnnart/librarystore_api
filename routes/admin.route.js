const express = require('express')

const router = express.Router()
const admin = require('../controller/admin.controller')

router.route('/login')
  .post(admin.login)

router.route('/register')
  .post(admin.register)

router.route('/history')
  .post(admin.history)

module.exports = router

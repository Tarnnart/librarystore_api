const express = require('express')
const admin = require('../controller/admin.controller')
const router = express.Router()

router.route('/login')
  .post(admin.login)

router.route('/register')
  .post(admin.register)

router.route('/history')
  .post(admin.history)

module.exports = router

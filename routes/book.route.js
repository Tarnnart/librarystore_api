const express = require('express')
const book = require('../controller/book.controller')
const router = express.Router()


router.route('/register')
  .post(book.register)

module.exports = router
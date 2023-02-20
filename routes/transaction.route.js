const express = require('express')
const transaction = require('../controller/transaction.controller')
const router = express.Router()

router.route('/rent')
  .post(transaction.rent)

router.route('/return')
  .post(transaction.return)

router.route('/book')
  .post(transaction.book)

router.route('/transaction')
  .post(transaction.transaction)

module.exports = router

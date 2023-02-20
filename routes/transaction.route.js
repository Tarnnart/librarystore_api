const express = require('express')

const router = express.Router()
const transaction = require('../controller/transaction.controller')

router.route('/rent')
  .post(transaction.rent)

router.route('/return')
  .post(transaction.return)

router.route('/book')
  .post(transaction.book)

router.route('/transaction')
  .post(transaction.transaction)

module.exports = router

const express = require('express')
const auth = require('../middleware/auth')
const admin = require('./admin.route')
const book = require('./book.route')
const transaction = require('./transaction.route')
const user = require('./user.route')

const app = express()
app.use(express.json())

app.use('/admin', auth.optional, admin)
app.use('/book', auth.optional, book)
app.use('/transaction', auth.optional, transaction)
app.use('/user', auth.optional, user)

module.exports = app

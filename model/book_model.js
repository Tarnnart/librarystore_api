const moment = require('moment')
const mongoose = require('../config/database')

const DateUse = moment().format()
const statusBook = ['Rent', 'Avaliable']
const catagory = ['Comedy', 'Ghost', 'Fantasy', 'Suspense']

const BooksSchema = mongoose.Schema({
  primaryIdBook: { type: String, required: true },
  idBook: { type: String, required: true, unique: true },
  bookName: { type: String, required: true },
  dateRegistration: { type: Date, default: DateUse },
  writer: { type: String },
  publisher: { type: String },
  catagory: { type: String, enum: catagory },
  status: { type: String, enum: statusBook },
})

module.exports = mongoose.model('bookData', BooksSchema)

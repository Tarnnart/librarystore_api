const mongoose = require('mongoose')
const moment = require('moment')

const DateUse = moment().format()

const usersSchema = mongoose.Schema({
  firstname: { type: String, require: true },
  lastname: { type: String, require: true },
  username: { type: String, unique: true },
  password: { type: String, require: true },
  token: {type: String},
  dateRegistration: { type: Date, default: DateUse }
})

module.exports = mongoose.model('userData', usersSchema)

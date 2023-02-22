const moment = require('moment')
const mongoose = require('../config/database')

const DateUse = moment().format()
const roleUser = ['ADMIN', 'USER']

const usersSchema = mongoose.Schema({
  firstname: { type: String, require: true },
  lastname: { type: String, require: true },
  username: { type: String, unique: true },
  password: { type: String, require: true },
  role: { type: String, enum: roleUser },
  token: { type: String },
  dateRegistration: { type: Date, default: DateUse },
})

module.exports = mongoose.model('userData', usersSchema)

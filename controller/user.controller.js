const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { tokenKey } = require('../config/vars')
const User = require('../model/user_model')
const History = require('../model/history_model')

const app = express()
app.use(express.json())

// User Register
exports.register = async (req, res) => {
  try {
    const {
      firstname, lastname, username, password,
    } = req.body
    if (!(firstname && lastname && username && password)) {
      return res.status(400).json({ data: 'All required' })
    }
    const oldUser = await User.findOne({ username }).lean()
    if (oldUser) {
      return res.status(409).json({ data: 'User alredy exist. Please login' })
    }
    // Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10)
    // Create user in our database
    const user = await User.create({
      firstname,
      lastname,
      username,
      password: encryptedPassword,
      role: 'USER',
    })
    // return new user
    res.status(201).json({ data: user })
  } catch (e) {
    console.log(e)
  }
}

// User login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!(username && password)) {
      return res.status(400).json({ data: 'All input required' })
    }
    const user = await User.findOne({ username, role: 'USER' }).lean()
    if (user && (await bcrypt.compare(password, user.password))) {
      const {
        role,
        _id,
      } = user
      const token = jwt.sign(
        {
          user_id: _id,
          username,
          role,
        },
        tokenKey,
        {
          expiresIn: '2h',
        },
      )
      user.token = token
      await User.updateOne(
        {
          _id,
        }, {
          token,
        },
      )
      return res.status(200).json({ status: 'Done', data: user })
    }
    return res.status.json({ status: 'Done', data: user })
  } catch (e) {
    console.log(e)
  }
}

// User History
exports.history = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const { username, firstname, lastname } = req.body
    let userHistoryobj = {}
    if (username) {
      userHistoryobj = {
        ...userHistoryobj,
        username,
      }
    }
    if (firstname) {
      userHistoryobj = {
        ...userHistoryobj,
        firstname,
      }
    }
    if (lastname) {
      userHistoryobj = {
        ...userHistoryobj,
        lastname,
      }
    }
    const userData = await History.find(userHistoryobj).exec()
    if (req.user.role !== 'USER') {
      return res.status(209).json({ data: 'Please try agin' })
    }
    // *** OUTPUT
    return res.status(202).json({ success: true, data: userData })
  } catch (e) {
    return res.status(408).json({ error: String(e) })
  }
}

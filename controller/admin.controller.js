// require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// const express = require('express')
const { tokenKey } = require('../config/vars')

const User = require('../model/user_model')
const History = require('../model/history_model')

// Admin Register
exports.register = async (req, res) => {
  try {
    const {
      firstname, lastname, username, password,
    } = req.body
    if (!(firstname && lastname && username && password)) {
      return res.status(400).json('All required')
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
      role: 'ADMIN',
    })
    // return new user
    return res.status(201).json({ data: user })
  } catch (e) {
    console.log(e)
  }
}

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    if (!(username && password)) {
      res.status(400).json('All input required')
    }
    const user = await User.findOne({ username, role: 'ADMIN' }).lean()
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
      return res.status(200).json({ data: user })
    }
    return res.status(400).json({ status: 'Done', data: user })
  } catch (e) {
    console.log(e)
  }
}

// Book History (Admin)
exports.history = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const {
      username, primaryIdBook, bookName, idBook, writer,
    } = req.body
    let bookHistoryobj = {}
    if (primaryIdBook) {
      bookHistoryobj = {
        ...bookHistoryobj,
        primaryIdBook,
      }
    }
    if (bookName) {
      bookHistoryobj = {
        ...bookHistoryobj,
        bookName,
      }
    }
    if (idBook) {
      bookHistoryobj = {
        ...bookHistoryobj,
        idBook,
      }
    }
    if (writer) {
      bookHistoryobj = {
        ...bookHistoryobj,
        writer,
      }
    }
    const bookData = await History.find(bookHistoryobj).exec()
    // console.log(bookData)
    const user = await User.findOne({ username, role: 'ADMIN' }).lean()
    if (req.user.role !== 'ADMIN') {
      return res.status(493).json({ data: 'Please try again' })
    }
    if (!(user)) {
      return res.status(495).json({ data: 'Please try again, Username not found or you not ADMIN' })
    }
    // *** OUTPUT
    return res.status(222).json({ success: true, data: bookData })
  } catch (e) {
    return res.status(404).json({ error: String(e) })
  }
}

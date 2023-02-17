require('dotenv').config()
require('../config/database').connect()

const express = require('express')
const User = require('../model/user.model')
const Book = require('../model/book_model')
const auth = require('../middleware/auth')

// Registration book
exports.register = auth, async (req, res) => {
    try {
      // *** INPUT
      console.log('req.body:', req.body)
      const {
        username,
        primaryIdBook,
        idBook,
        status,
      } = req.body
  
      const user = await User.findOne({ username, role:'ADMIN' })
      if (!(user)) {
        return res.status(495).send('Please try again, Username not found or you not ADMIN')
      }

      if (!(primaryIdBook && idBook)) {
        res.status(400).send('All required')
    }

    const bookOldCheck = await Book.find({ primaryIdBook })
    if (bookOldCheck.length > 0) {
      const oldBook =  bookOldCheck.find((v) => v.idBook === idBook)
      if (oldBook && user) {
          return res.status(409).send('Book alredy library. Please try again')
      }
      const _bookOldCheck = bookOldCheck[0]
      await new Book({
      primaryIdBook: _bookOldCheck.primaryIdBook ,
      idBook,
      bookName: _bookOldCheck.bookName,
      dateRegistration: DateUse,
      writer: _bookOldCheck.writer,
      publisher: _bookOldCheck.publisher,
      catagory: _bookOldCheck.catagory,
      status,
    }).save()
    }

      return res.json('done') // Response message
    } catch (e) {
      console.log(e)
      return res.json('failed') // Response message
    }
  }

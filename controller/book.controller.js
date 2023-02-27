// require('dotenv').config()
// const express = require('express')
const moment = require('moment')

const User = require('../model/user_model')
const Book = require('../model/book_model')

const DateUse = moment().format()

// Registration book
exports.register = async (req, res) => {
  try {
    // *** INPUT
    console.log('req.body:', req.body)
    const {
      primaryIdBook,
      idBook,
      status,
    } = req.body

    // add ข้อมูลหนังสือต่่างๆ ถ้ายังไม่มีของเดิม
    const user = await User.findOne({ role: 'ADMIN' }).lean()
    if (!req.user || (req.user.role !== 'ADMIN')) {
      return res.status(209).json({ data: 'Please try again, Username not found or you not ADMIN' })
    }
    if (!(primaryIdBook && idBook)) {
      return res.status(400).json({ data: 'All required' })
    }
    const bookOldCheck = await Book.find({ primaryIdBook }).lean()
    if (bookOldCheck.length > 0) {
      const oldBook = bookOldCheck.find((v) => v.idBook === idBook)
      if (oldBook && user) {
        return res.status(409).json({ data: 'Book alredy library. Please try again' })
      }
      const _bookOldCheck = bookOldCheck[0]
      await new Book({
        primaryIdBook: _bookOldCheck.primaryIdBook,
        idBook,
        bookName: _bookOldCheck.bookName,
        dateRegistration: DateUse,
        writer: _bookOldCheck.writer,
        publisher: _bookOldCheck.publisher,
        catagory: _bookOldCheck.catagory,
        status,
      }).save()
    }
    // await Book.create({
    //   primaryIdBook,
    //   idBook,
    //   bookName,
    //   dateRegistration: DateUse,
    //   writer,
    //   publisher,
    //   catagory,
    //   status,
    // })
    return res.status(202).json({ status: 'done', data: Book }) // Response message
  } catch (e) {
    console.log(e)
    return res.status(404).json({ data: 'failed' }) // Response message
  }
}

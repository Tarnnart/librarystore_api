// require('dotenv').config()
const { mongouri }  = require('../config/vars')
const express = require('express')
const User = require('../model/user.model')
const Book = require('../model/book_model')
const History = require('../model/history_model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

const moment = require('moment')
const DateUse = moment().format()

calcDate = (dateRent, dateReturn) => {
  /*
  * calcDate() : Calculates the difference between two dates
  * @date1 : "First Date in the format MM-DD-YYYY"
  * @date2 : "Second Date in the format MM-DD-YYYY"
  * return : Array
  */
  // new date instance
  const DTdate1 = new Date(dateRent)
  const DTdate2 = new Date(dateReturn)

  // Get the Timestamp
  const date1TimeStamp = DTdate1.getTime()
  const date2TimeStamp = DTdate2.getTime()

  let calc

  // Check which timestamp is greater
  if (date1TimeStamp > date2TimeStamp) {
    calc = new Date(date1TimeStamp - date2TimeStamp)
  } else {
    calc = new Date(date2TimeStamp - date1TimeStamp)
  }

  // Retrieve the date, month and year
  const calcFormatTmp = `${calc.getDate()}-${calc.getMonth() + 1}-${calc.getFullYear()}`
  // Convert to an array and store
  const calcFormat = calcFormatTmp.split('-')
  // Subtract each member of our array from the default date
  const daysPassed = Number(Math.abs(calcFormat[0]) - 1)
  const monthsPassed = Number(Math.abs(calcFormat[1]) - 1)
  const yearsPassed = Number(Math.abs(calcFormat[2]) - 1970)

  // Set up custom text
  const yrsTxt = ['year', 'years']
  const mnthsTxt = ['month', 'months']
  const daysTxt = ['day', 'days']

  // Convert to days and sum together
  const totalDays = (yearsPassed * 365) + (monthsPassed * 30.417) + daysPassed
  const penalty = totalDays - 3
  const penaltySum = penalty * 20
  console.log(penaltySum)

  // display result with custom text
  const result = ((yearsPassed == 1) ? `${yearsPassed} ${yrsTxt[0]} ` : (yearsPassed > 1)
  ? `${yearsPassed} ${yrsTxt[1]} ` : '')
  + ((monthsPassed == 1) ? `${monthsPassed} ${mnthsTxt[0]}` : (monthsPassed > 1)
  ? `${monthsPassed} ${mnthsTxt[1]} ` : '')
  + ((daysPassed == 1) ? `${daysPassed} ${daysTxt[0]}` : (daysPassed > 1)
  ? `${daysPassed} ${daysTxt[1]}` : '')
  
  // return the result
  return {
    total_days: Math.round(totalDays),
    // result: result.trim(),
  }
}

// Rent
exports.rent = async (req, res) => {
    console.log('req.body:', req.body)
    const {
      username,
      idBook,
    } = req.body
    const user = await User.findOne({ username, role:'USER' })
    const book = await Book.findOne({ idBook, status:'Avaliable' })
    if (!(user)) {
      return res.status(490).send({data : 'Please try again, Username not found or you not USER'})
    }
    if (!(book)) {
      return res.status(491).send({data : 'Please try again, Book not already for rent'})
    }
    // console.log(book)
    const currentBookRent = await History.find({ username, status:'Rent'})
    // ถ้ายืม id นี้แล้ว ไม่ให้ยืมซ้ำ
    if (currentBookRent != null && currentBookRent.length > 0) {
      const _currentBookRent =  currentBookRent.find(v => v.idBook === idBook)
      const __currentBookRent = currentBookRent.find(v => v.bookName === book.bookName)
      if (_currentBookRent && __currentBookRent) {
         return res.status(489).send({data : 'Please try again'})
      }
     console.log(currentBookRent.length)
    if (currentBookRent.length >= 5) {
      return res.status(492).send({data : 'Have already 5 book to rent, Please return for new rent book'})
    }
  }
  await book.updateOne({
    idBook,
      status: 'Avaliable',
  }, {
      status: 'Rent'
  })
    const bookRent = await new History({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      primaryIdBook: book.primaryIdBook,
      idBook: book.idBook,
      bookName: book.bookName,
      dateRent: DateUse,
    }).save()
    // const updateBookData = await BookRegistration.findOneAndUpdate({ status: 'Rent' })
    return res.status(202).json(bookRent)
  }

// Return
exports.return = async (req, res) => {
    console.log('req.body:', req.body)
  
    // Input
    const { username,idBook } = req.body
  
    // Check role
    const user = await User.findOne({ role:'ADMIN' })
    if (!(user)) {
       return res.status(200).json({data : user})
    }

    // Find data
    const returnDataHistory = await History.findOne({ username, idBook, status:'Rent' })
    if (!(returnDataHistory)){
      return res.status(493).send({data : 'Please try again'})
    } 
     const CalculatesDate = calcDate(returnDataHistory.dateRent, DateUse)
     await History.updateOne({ 
      username,
       idBook,
        status:'Rent'
       },{
        dateEnd: DateUse,
        penalty: CalculatesDate.calcDate,
        status : 'Finish',
       })
  
    return res.status(202).json({data : 'Update Done'})
  }

// Book History (Admin)
exports.book = async (req, res) => {
    try {
      console.log(req.user)
      console.log('req.body:', req.body)
      const { username, primaryIdBook, bookName, idBook, writer} = req.body
         let bookHistoryobj = {}
            if(username){
                bookHistoryobj = {
                ...bookHistoryobj,
                username,
                }
            }
            if(primaryIdBook){
                bookHistoryobj = {
                ...bookHistoryobj,
                primaryIdBook,
                }
            }
            if(bookName){
                bookHistoryobj = {
                ...bookHistoryobj,
                bookName,
                }
            }
            if(idBook){
                bookHistoryobj = {
                ...bookHistoryobj,
                idBook,
                }
            }
            if(writer){
                bookHistoryobj = {
                ...bookHistoryobj,
                writer,
                }
            }
    const bookData = await History.find(bookHistoryobj).exec()
    // console.log(bookData)
    const user = await User.findOne({ username, role:'ADMIN' })
    if (!(user)) {
      return res.status(495).send({data : 'Please try again, Username not found or you not ADMIN'})
    }
        // *** OUTPUT
    return res.status(202).json({ success: true, data: bookData })
    } catch (e) {
      return res.status(408).json({ error: String(e) })
    }
  }

// Transaction 
exports.transaction = async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const { username, firstname, lastname } = req.body
    let userHistoryobj = {}
        if(username){
          userHistoryobj = {
         ...userHistoryobj,
          username,
          }
      }
       if(firstname){
           userHistoryobj = {
          ...userHistoryobj,
          firstname,
           }
       }
       if(lastname){
          userHistoryobj = {
          ...userHistoryobj,
          lastname,
           }
       }
       const userData = await History.find(userHistoryobj).exec()
      //  const user = await User.findOne({role:'USER'})
      //  if (!(user)) {
      //    return res.status(495).send('Please try again, Username not found or you not ADMIN')
      //   }
      // *** OUTPUT
      return res.status(202).json({ success: true, data: userData })
   } catch (e) {
      return res.status(408).json({ error: String(e) })
    }
}

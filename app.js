require('dotenv').config()
require('./config/database').connect()


const express = require('express')
const User = require('./model/user.model')
const Book = require('./model/book_model')
const BookRent = require('./model/book_model')
const History = require('./model/book_model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')

const moment = require('moment')
const DateUse = moment().format()

const app = express()
app.use(express.json())

// Register
app.post("/register", async (req, res) => {

    try {

        const { firstname, lastname, username, password } = req.body

        if (!(firstname && lastname && username && password)) {
            res.status(400).send('All required')
        }

        const oldUser = await User.findOne({ username })

        if (oldUser) {
            return res.status(409).send('User alredy exist. Please login')
        }

        // Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 1)

        // Create user in our database
        const user = await User.create({
            firstname,
            lastname,
            username,
            password: encryptedPassword
        })

        // Create token
        const token = jwt.sing(
            { user_id: user._id, username},
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h"
            }
        )

        // save user ttoken
        user.token = token

        // return new user
        res.status(201).json(user)

    } catch (e) {
        console.log(e)
    }
})
    
// login
app.post("/login", async (req, res) => {
    try {
        const { username, password} = req.body

        if (!(username && password)) {
            res.status(400).send('All input required')
        }

        const user = await User.findOne({ username })

        if (user && (await bcrypt.compare(password, user.password))) {

            const token = jwt.sign(
                {user_idid: user._id, username},
                process.env.TOKEN_KEY,
                {
                    expiresIn: '2h'
                }
            )
            user.token = token

            res.status(200).json(user)
        }

        res.status(400).send('Invalid Credentials')
        
    }catch (e) {
        console.log(e)
    
}})

// access token
app.post('/nextpage', auth, (req, res) => {
    res.status(200).send('Welcome to my world')
})

// Registration book
app.post('/book/registration', async (req, res) => {
    try {
      // *** INPUT
      console.log('req.body:', req.body)
      const {
        primaryIdBook,
        idBook,
        bookName,
        dateRegistration,
        writer,
        publisher,
        catagory,
        status,
        totalBook,
      } = req.body
  
      if (!(primaryIdBook && idBook && bookName && writer && publisher && catagory && totalBook)) {
        res.status(400).send('All required')
    }

    const oldBook = await Book.findOne({ idBook })

    if (oldBook) {
        return res.status(409).send('Book alredy library. Please try again')
    }
      const bookRegistration = await new Book({
        primaryIdBook,
        idBook,
        bookName,
        dateRegistration,
        writer,
        publisher,
        catagory,
        status,
        totalBook,
      }).save()
      return res.json('done') // Response message
    } catch (e) {
      console.log(e)
      return res.json('failed') // Response message
    }
  })

// Book History
app.post('/book/data', async (req, res) => {
    try {
      // *** INPUT
      console.log('req.body:', req.body)
      const { primaryIdBook, bookName, idBook, writer} = req.body
         let bookHistoryobj = {}
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
      if (!(primaryIdBook || bookName || idBook || writer)) {
        res.status(404).send('Not Found')
    }

    const bookData = await History.findOne({
        firstname,
        lastname,
        username,
        status,
        primaryIdBook,
        idBook,
        bookName,
        dateRent,
        dateEnd,
        penalty
    }).exec()

    if (bookData) {
        return res.status(405).send('Please try again')
    }

        // *** OUTPUT
    return res.json({ success: true, data: bookData })
    } catch (e) {
      return res.json({ error: String(e) })
    }
  })

function calcDate(dateRent, dateReturn) {
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
// Compass historydatas
app.post('/book/rent', async (req, res) => {
    console.log('req.body:', req.body)
    const {
      username,
      bookName,
    } = req.body
  
    const user = await User.findOne({ username })
    const book = await Book.findOne({ bookName })
  
    const bookRent = await new BookRent({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      // status: book.status,
      primaryIdBook: book.primaryIdBook,
      idBook: book.idBook,
      bookName: book.bookName,
      dateRent: DateUse,
    }).save()
  
    // const updateBookData = await BookRegistration.findOneAndUpdate({ status: 'Rent' })
  
    return res.json(bookRent)
  })

// Return
// Compass historydatas
app.post('/return', async (req, res) => {
    console.log('req.body:', req.body)
  
    // Input
    const { username } = req.body
  
    // Find data
    const returnDataHistory = await History.findOne({ username })
  
    // calcDate(dateEnd - dateEnd)
    // const DateMath1 = new dateRent
    // const DateMath2 = new dateEnd
  
    const CalculatesDate = calcDate(returnDataHistory.dateRent, DateUse)
  
    const BookReturn = await new History({
      firstname: returnDataHistory.firstname,
      lastname: returnDataHistory.lastname,
      username: returnDataHistory.username,
      primaryIdBook: returnDataHistory.primaryIdBook,
      idBook: returnDataHistory.idBook,
      nameBook: returnDataHistory.nameBook,
      dateRent: returnDataHistory.dateRent,
      dateEnd: DateUse,
      penalty: CalculatesDate.penalty,
    }).save()
  
    // const updateBookData = await BookRegistration.findOneAndUpdate({ status: 'Rent' })
  
    return res.json(BookReturn)
  })

module.exports = app
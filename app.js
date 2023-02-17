require('dotenv').config()
require('./config/database').connect()

const express = require('express')
const User = require('./model/user.model')
const Book = require('./model/book_model')
const History = require('./model/history_model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('../middleware/auth')

const moment = require('moment')
const DateUse = moment().format()

const app = express()
app.use(express.json())

// User Register
app.post("/register/user", async (req, res) => {

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
        encryptedPassword = await bcrypt.hash(password, 10)

        // Create user in our database
        const user = await User.create({
            firstname,
            lastname,
            username,
            password: encryptedPassword,
            role: 'USER',
        })

        // return new user
        res.status(201).json(user)

    } catch (e) {
        console.log(e)
    }
})

// Admin Register
app.post("/register/admin", async (req, res) => {

  try {

      const { firstname, lastname, username, password, role } = req.body

      if (!(firstname && lastname && username && password)) {
          res.status(400).send('All required')
      }

      const oldUser = await User.findOne({ username })

      if (oldUser) {
          return res.status(409).send('User alredy exist. Please login')
      }
      // Encrypt user password
      encryptedPassword = await bcrypt.hash(password, 10)

      // Create user in our database
      const user = await User.create({
          firstname,
          lastname,
          username,
          password: encryptedPassword,
          role: 'ADMIN'
      })

      // return new user
      res.status(201).json(user)

  } catch (e) {
      console.log(e)
  }
})
    
// User login
app.post("/login/user", async (req, res) => {
    try {
        const { username, password} = req.body

        if (!(username && password)) {
            res.status(400).send('All input required')
        }

        const user = await User.findOne({ username, role:'USER' })

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
        
    } catch (e) {
        console.log(e)
    }
})

// Admin login
app.post("/login/admin", async (req, res) => {
  try {
      const { username, password} = req.body

      if (!(username && password)) {
          res.status(400).send('All input required')
      }

      const user = await User.findOne({ username, role:'ADMIN' })

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
      
  } catch (e) {
      console.log(e)
  }
})

// access token
app.post('/nextpage', auth, (req, res) => {
    res.status(200).send('Welcome to my world')
})

// Registration book
app.post('/register/book', auth, async (req, res) => {
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
  })
  
// Book History (Admin)
app.post('/transaction/book',auth, async (req, res) => {
    try {
      console.log('req.body:', req.body)
      const { username, primaryIdBook, bookName, idBook, writer} = req.body
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
    const bookData = await History.find(bookHistoryobj).exec()
    // console.log(bookData)
    const user = await User.findOne({ username, role:'ADMIN' })
    if (!(user)) {
      return res.status(495).send('Please try again, Username not found or you not ADMIN')
    }
        // *** OUTPUT
    return res.json({ success: true, data: bookData })
    } catch (e) {
      return res.json({ error: String(e) })
    }
  })

// User History
app.post('/transaction/user/admin', auth, async (req, res) => {
  try {
    console.log('req.body:', req.body)
    const { username, firstname, lastname } = req.body
    let userHistoryobj = {}
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
       const user = await User.findOne({username, role:'ADMIN' })
       if (!(user)) {
         return res.status(495).send('Please try again, Username not found or you not ADMIN')
        }
      // *** OUTPUT
      return res.json({ success: true, data: userData })
   } catch (e) {
      return res.json({ error: String(e) })
    }
})    

app.post('/transaction/user', auth, async (req, res) => {
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
      return res.json({ success: true, data: userData })
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
app.post('/transaction/rent',auth ,async (req, res) => {
    console.log('req.body:', req.body)
    const {
      username,
      idBook,
    } = req.body
  
    const user = await User.findOne({ username, role:'USER' })
    const book = await Book.findOne({ idBook, status:'Avaliable' })

    if (!(user)) {
      return res.status(490).send('Please try again, Username not found or you not USER')
    }
    if (!(book)) {
      return res.status(491).send('Please try again, Book not already for rent')
    }

    // console.log(book)
    const currentBookRent = await History.find({ username, status:'Rent'})
    // ถ้ายืม id นี้แล้ว ไม่ให้ยืมซ้ำ
    if (currentBookRent != null && currentBookRent.length > 0) {
      const _currentBookRent =  currentBookRent.find(v => v.idBook === idBook)
      const __currentBookRent = currentBookRent.find(v => v.bookName === book.bookName)
      // const ___currentBookRent = currentBookRent.find(v => v.username === History.username)
      if (_currentBookRent && __currentBookRent) {
         return res.status(489).send('Please try again')
      }

     console.log(currentBookRent.length)
    if (currentBookRent.length >= 5) {
      return res.status(492).send('Have already 5 book to rent, Please return for new rent book')
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
    return res.json(bookRent)
  })

// Return
// Compass historydatas
app.post('/transaction/return',auth, async (req, res) => {
    console.log('req.body:', req.body)
  
    // Input
    const { username,idBook } = req.body
  
    // Check role
    const user = await User.findOne({ role:'ADMIN' })
    if (!(user)) {
       return res.status(200).json(user)
    }

    // Find data
    const returnDataHistory = await History.findOne({ username, idBook, status:'Rent' })
    if (!(returnDataHistory)){
      return res.status(493).send('Please try again')
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
  
    return res.json('Update Done')
  })

module.exports = app
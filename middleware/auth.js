const jwt = require('jsonwebtoken')
// const { book } = require('../controller/transaction.controller')
const User = require('../model/user_model')

const config = process.env

const verifyToken = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  console.log(token)
  if (!token) {
    return res.status(403).json({ data: 'A token is required for authentication' })
  }
  try {
    const userId = await User.findOne({ token }).lean()
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    // const { user_id } = decoded
    // console.log(decoded)
    // if (!user_id) throw 'wrong token one'

    console.log(userId)
    if (!userId) throw 'wrong token'
    req.user = decoded
  } catch (e) {
    console.log(e)
    return res.status(401).json({ data: 'Invalid Token' })
  }
  return next()
}

const optional = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  if (!optional) {
    return res.status(401).json({ data: 'Invalid Token' })
  }
  // console.log(token)
  if (!token) {
    return next()
  }
  try {
    const authOptionnal = await User.findOne({ token }).lean()
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    // console.log(authOptionnal)
    if (!authOptionnal) throw 'wrong token'
    req.user = decoded
  } catch (e) {
    // console.log(e)
    return res.status(401).json({ data: 'Invalid Token' })
  }
  return next()
}

// const Auth = async (req, res, next) => {
//   // setup the class and hide the body by default
//  await constructor() {
//     // document.querySelector('body').style.display = 'none'
//     const auth = book.getItem('auth')
//     this.validateAuth(auth)
//   }

//   // check to see if the localStorage item passed to the function is valid and set
//   validateAuth(auth) {
//     if (auth !== 1) {
//       book.location.replace('/')
//     } else {
//       // .querySelector('body').style.display = 'block'
//     }
//  }

// will remove the localStorage item and redirect to login  screen
// logOut(){
//   book.removeItem('auth')
//   book.location.replace('/')
// }
// }
// const middleware = (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     req.authenticated = !!user
//     next()
//   })(req, res, next)
// }

// module.exports = (verifyToken, optional)
// module.exports = optional
module.exports = {
  optional,
  verifyToken,
  // Auth,
}

// abc()=>{
// try {

// } catch (error) {
//   throw 'xxxx'
// }
// }

// try {
//     abc()
// } catch (error) {

// }

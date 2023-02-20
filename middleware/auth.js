const jwt = require('jsonwebtoken')
const User = require('../model/user.model')

const config = process.env

const verifyToken = async (req, res, next) => {
  const token = req.body.token || req.query.token || req.headers['x-access-token']
  console.log(token)
  if (!token) {
    return res.status(403).json({ data: 'A token is required for authentication' })
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY)
    const { userId } = decoded
    if (!userId) throw 'wrong token'
    const user = await User.findOne({ token })
    if (!user) throw 'wrong token'
    req.user = decoded
  } catch (e) {
    return res.status(401).json({ data: 'Invalid Token' })
  }
  return next()
}
module.exports = verifyToken

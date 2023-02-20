require('dotenv').config()

module.exports = {
  mongouri: process.env.MONGO_URI,
  tokenKey: process.env.TOKEN_KEY,
}

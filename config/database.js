const mongoose = require('mongoose')
const vars = require('./vars')

const { mongouri } = vars
mongoose.connect(mongouri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false
})
  .then(() => {
    console.log('Successfully connect to database')
  })
  .catch((e) => {
    console.log('Error connecting to database')
    console.error(e)
    process.exit(1)
  })

module.exports = mongoose

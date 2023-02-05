const mongoose =require('mongoose')

const { MONGO_URI } = process.env

exports.connect = () => {

    mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        // useCreateIndex: true,
        // useFindAndModify: false
    })
    .then(() => {
        console.log("Successfully connect to database")
    })
    .catch((e) => {
        console.log("Error connecting to database")
        console.error(e)
        process.exit(1)
    })
}
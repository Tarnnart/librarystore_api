require('dotenv').config()
require('./config/database').connect()


const express = require('express')
const User = require('./model/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')

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

app.post('/nextpage', auth, (req, res) => {
    res.status(200).send('Welcome to my world')
})

module.exports = app
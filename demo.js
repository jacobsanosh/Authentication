const express = require('express')
const bdparse = require('body-parser')
    //library for hashing
const md5 = require('md5')
    //lib for salting
const bcrypt = require('bcrypt')
const { use } = require('passport')
const mongoose = require('mongoose');

const app = express()
const port = 3000;
app.use(bdparse.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
const db = require(__dirname + '/database.js')
const session = require('express-session');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
const e = require('express')
app.use(session({
    secret: 'hello how are you',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/sanosh')
const USER_SCHEMA = new mongoose.Schema({
        uname: {
            type: String,
            // required: true
        },
        password: {
            type: String,
            // required: true
        }
    })
    //adding encryption
    // USER_SCHEMA.plugin(encrypt, { secret: process.env.SECRET_KEY, encryptedFields: ['password'] });

USER_SCHEMA.plugin(passportLocalMongoose)
const user_table = new mongoose.model('users', USER_SCHEMA)

passport.use(user_table.createStrategy())
passport.serializeUser(user_table.serializeUser())
passport.deserializeUser(user_table.deserializeUser())


app.get('/', (req, res) => {
    //get code here
    res.render('home')
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/register', (req, res) => {
    res.render('register')
})
app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets')
    } else {
        res.redirect('/login')
    }
})
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {

        } else {

            res.redirect('/')
        }
    });
})
app.post('/register', (req, res) => {
    //post code for register
    // console.log(req.body.username, req.body.password)
    //using md5 (hashing)
    // const save_data = new user_table({ uname: data.username, password: md5(data.password) })


    //using salting to store the data
    // let salt_round = 10;
    // bcrypt.hash(data.password, salt_round, (err, hash) => {
    //     if (!err) {
    //         const save_data = new user_table({ uname: data.username, password: hash })
    //         save_data.save((err) => {
    //             if (err) {
    //                 rejects(new Error("error on register"))
    //             } else {
    //                 resolve("saved")
    //             }
    //         })
    //     }
    // })
    user_table.register({ username: req.body.username }, req.body.password, (err, result) => {
        if (err) {
            console(err)
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })

        }
    })

})
app.post('/login', (req, res) => {
    //checking username and password
    // console.log(md5(req.body.password))
    // if (data.uname == req.body.username && data.password == md5(req.body.password)) {
    //     res.render('secrets')
    // } else {
    //     console.log("invalid password")
    // }

    //using salting
    // bcrypt.compare(req.body.password, data.password, ((err, result) => {
    //     if (result === true) {
    //         res.render('secrets')
    //     } else {
    //         res.send('invalid password')
    //     }
    // }))

    let user = new user_table({
        username: req.body.username,
        password: req.body.password
    })
    console.log(user)
    req.login(user, (err) => {
        if (err) {
            console.log(err)
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets')
            })

        }
    })


})
app.listen(port, () => {
    console.log('started at port 3000')
})
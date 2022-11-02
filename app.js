const express = require('express')
const bdparse = require('body-parser');
const passport = require('passport');
const app = express()
const port = 3000;
app.use(bdparse.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
const db = require(__dirname + '/db.js')
const session = require('express-session');
app.use(session({
    secret: 'hello how are you',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


db.connect().then((dbs) => {
        passport.use(dbs.createStrategy())
        passport.serializeUser(dbs.serializeUser())
        passport.deserializeUser(dbs.deserializeUser())
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
            db.registers(req.body).then((data) => {
                    passport.authenticate('local')(req, res, () => {
                        res.redirect('/secrets')
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
        })
        app.post('/login', (req, res) => {
            let user = new user_table({
                username: req.body.username,
                password: req.body.password
            })
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
    })
    .catch((err) => {
        console.log(err)
    })
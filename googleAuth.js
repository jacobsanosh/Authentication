const express = require('express')
const bdparse = require('body-parser')
const passport = require('passport');
const app = express()
const port = 3000;
app.use(bdparse.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require(__dirname + '/db.js')
const session = require('express-session');
app.use(session({
    secret: 'hello how are you',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
require('dotenv').config();
db.connect().then((dbs) => {
    passport.use(dbs.createStrategy())
    passport.serializeUser((dbs, done) => {
        done(null, dbs.id)
    })
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    //adding google stratergy
    passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/redirect"
        },
        function(accessToken, refreshToken, profile, cb) {
            // console.log(profile)
            dbs.findOrCreate({ googleId: profile.id }, function(err, user) {
                return cb(err, user);
            });
        }
    ));
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
        //by this we will get the profile of the user
    app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }))
    app.post('/', (req, res) => {
        //post code here
    })
    app.get('/auth/redirect', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
        res.redirect('/secrets')
    })
    app.get('/secrets', (req, res) => {
        console.log("on secrets")
        if (req.isAuthenticated()) {
            db.find_secrets().then((result) => {
                    console.log("results are", result)
                    res.render('secrets', { users_secrets: result })

                })
                .catch((err) => {
                    console.log(err)
                })
        } else {
            res.redirect('/login')
        }
    })
    app.get('/submit', (req, res) => {
        if (req.isAuthenticated()) {
            res.render('submit')
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
                res.redirect('/secrets')
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
    app.post('/submit', (req, res) => {
        console.log(req.user)
        db.findUser(req).then(() => {
                console.log("saved")
                res.redirect('/secrets')
            })
            .catch((err) => {
                console.log(err)
            })
    })
    app.listen(port, () => {
        console.log('started at port 3000')
    })
}).catch((err) => {
    console.log(err)
});
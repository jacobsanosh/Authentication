require('dotenv').config();
const { rejects } = require('assert');
const mongoose = require('mongoose');
const { resolve } = require('path');
const encrypt = require('mongoose-encryption')
const md5 = require('md5')

//library for salting
const bcrypt = require('bcrypt')
let user_table;


//libraries and setting for passport
const express = require('express')
const app = express()
const session = require('express-session');
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
app.use(session({
    secret: 'hello how are you',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())


//for connecting db
exports.connect = () => {
        return new Promise((resolve, rejects) => {
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
            user_table = new mongoose.model('users', USER_SCHEMA)
            passport.use(user_table.createStrategy())
            passport.serializeUser(user_table.serializeUser())
            passport.deserializeUser(user_table.deserializeUser())
            resolve(user_table)
        })
    }
    //to save login page
exports.registers = (data) => {
    return new Promise((resolve, rejects) => {
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
        console.log(user_table)
        console.log(data)
        user_table.register(({ username: data.username }), data.password, ((err, res) => {
            if (err) {
                rejects(err)
            } else {
                passport.authenticate('local')
                resolve(res)
            }
        }))


    })
}

exports.logins = (data) => {
    return new Promise((resolve, rejects) => {
        // user_table.findOne({ uname: data.username }, (err, data) => {
        //     if (err) {
        //         rejects("cannot find an one")
        //     } else {
        //         resolve(data)
        //     }
        // })
        console.log("hi")
        let user = {
            username: data.username,
            password: data.password
        }
        passport.authenticate('local', )
    })
}
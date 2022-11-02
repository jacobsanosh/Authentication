const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const passport = require('passport');
const findOrCreate = require('mongoose-findorcreate')
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
                    },
                    googleId: String,
                    secrets: String
                })
                //adding encryption
                // USER_SCHEMA.plugin(encrypt, { secret: process.env.SECRET_KEY, encryptedFields: ['password'] });

            USER_SCHEMA.plugin(passportLocalMongoose)
            USER_SCHEMA.plugin(findOrCreate)
            user_table = new mongoose.model('users', USER_SCHEMA)

            resolve(user_table)
        })
    }
    //to save login page
exports.registers = (data) => {
    return new Promise((resolve, rejects) => {
        user_table.register(({ username: data.username }), data.password, ((err, res) => {
            if (err) {
                rejects(err)
            } else {
                resolve(res)
            }
        }))
    })
}

exports.findUser = (req) => {
    return new Promise((resolve, rejects) => {
        user_table.findOne({ _id: req.user }, (err, found_user) => {
            if (err) {
                rejects(err);
            } else {
                found_user.secrets = req.body.secret;
                found_user.save((err) => {
                    if (!err) {
                        resolve("saved")
                    }
                })
            }
        })
    })
}
exports.find_secrets = () => {
    return new Promise((resolve, rejects) => {
        user_table.find({ 'secrets': { $ne: null } }, (err, users) => {
            if (!err) {
                resolve(users)
            } else {
                rejects(err)
            }
        })
    })
}
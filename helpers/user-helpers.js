var db = require('../config/connection')
const collection = require('../config/collection')
const bcrypt = require('bcrypt');

module.exports = {
    doSignup:async (userData) => {
        console.log(userData)
        data = {
            name: userData.name,
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10)
        }
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).insertOne(data).then((err, res) => {
                if (err)
                    console.log(err)
                else
                    console.log(res)
                resolve()
            })
        })
    }
}
const db = require('../app')
// const users = db.users
// const images = db.images
const collection = require('../config/collection')
const bcrypt = require('bcrypt');

var objectId = require('mongodb').ObjectId
require('dotenv').config()

const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.TELLUS_EMAIL,
        pass: process.env.TELLUS_PASSWORD
    }
});


module.exports = {
    doSignup: async (userData, imageData) => {
        userData.password = await bcrypt.hash(userData.password, 10);
        
        try {
            const result = await db.users.create(userData)
          } catch (error) {
            // Check if the error is a duplicate key error
            if (error.code === 11000) {
              console.error('Duplicate key error:', error.keyValue);
              return false;
              // Handle the error here
            } else {
              // Handle other types of errors
              console.error(error);
              return false;
            }
          }
          
        if (imageData) {
            imageData = imageData.image
            const newImage = new db.images({
                name: imageData.name,
                data: imageData.data,
                mimetype: imageData.mimetype,
                size: imageData.size,
                uid: result._id
            });

            newImage.save((err, savedImage) => {
                if (err) {
                    console.log('Error saving image:', err);
                } else {
                    console.log('Image saved successfully:', savedImage);
                }
            });
        }
        let mailOptions = {
            from: process.env.TELLUS_EMAIL,
            to: result.email,
            subject: 'Tellus Signup success',
            text: 'Hello, ' + result.name + ' ,\n' +
                'Signup success....Welcome to tellus community'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        return result;
    },
    doLogin: async (userData) => {
        async function authenticateUser(username, password) {
            let user = await db.users.findOne({ id: username });
            if (!user) {
                return null; // user not found
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                return null; // password doesn't match
            }
            return user;
        }
        let user = await authenticateUser(userData.id, userData.password);
        if (user) {
            // Find the user by their id and retrieve only the 'name' field
            const x = user._id
            async function getImage(x) {
                try {
                    const image = await new Promise((resolve, reject) => {
                        db.images.findOne({ uid: x }, { 'data': 1, 'mimetype': 1 }, function (err, image) {
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                console.log('Got the image');
                                resolve(image);
                            }
                        });
                    });
                    return image;
                } catch (err) {
                    console.log(err);
                    return null;
                }
            }

            image = await getImage(x);
            user.image = image;
            console.log(image)
            return user;
        } else {
            return null;
        }



    },
    doPost: async (postData, imageData) => {
        const result = await db.posts.create(postData)
        if (imageData) {
            imageData = imageData.image
            const newImage = new db.images({
                name: imageData.name,
                data: imageData.data,
                mimetype: imageData.mimetype,
                size: imageData.size,
                uid: result._id
            });
            newImage.save((err, savedImage) => {
                if (err) {
                    console.log('Error saving image:', err);
                    return false;
                } else {
                    console.log('Image saved successfully:', savedImage);
                    return true;
                }
            });
        }
        return result;
    },
    getPost: async () => {
        const result = await db.posts.aggregate([
            {
                $lookup: {
                    from: 'images',
                    localField: '_id',
                    foreignField: 'uid',
                    as: 'images'
                }
            },
            {
                $project: {
                    _id: 0,
                    description: 1,
                    location: 1,
                    userid: 1,
                    datetime: 1,
                    images: {
                        data: 1,
                        mimetype: 1
                    }
                }
            },
            {
                $sort: {
                    datetime: -1
                }
            }
        ]).exec();

        if (result) {
            console.log(result[0].images);
            return result;
        } else {
            console.log("Error retrieving posts with images");
            return null;
        }


    }
}
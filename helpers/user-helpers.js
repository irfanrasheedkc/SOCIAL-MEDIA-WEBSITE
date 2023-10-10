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
            const newImage = new db.profiles({
                name: imageData.name,
                data: imageData.data,
                mimetype: imageData.mimetype,
                size: imageData.size,
                userid: userData.id
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
            to: userData.email,
            subject: 'Tellus Signup success',
            text: 'Hello, ' + userData.name + ' ,\n' +
                'Signup success....Welcome to tellus community'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        return userData;
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
            const x = user.id
            async function getImage(x) {
                try {
                    const image = await new Promise((resolve, reject) => {
                        db.profiles.findOne({ userid: x }, { 'data': 1, 'mimetype': 1 }, function (err, image) {
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

            image = await getImage(user.id);
            user.image = image;
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
    getPost: async (userId) => {
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
                $lookup: {
                    from: 'profiles',
                    localField: 'userid',
                    foreignField: 'userid',
                    as: 'userImage'
                }
            },
            {
                $project: {
                    _id: 1,
                    description: 1,
                    location: 1,
                    userid: 1,
                    datetime: 1,
                    images: {
                        data: 1,
                        mimetype: 1
                    },
                    userImage: {
                        data: 1,
                        mimetype: 1
                    },
                    like: {
                        $in: [userId, "$likes"]
                    },
                    likecount:{
                        $size: '$likes'
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
            return result;
        } else {
            console.log("Error retrieving posts with images");
            return null;
        }
    },
    getUserPost: async (userId) => {
        const result = await db.posts.aggregate([
            {
                $match: {
                    userid: userId
                }
            },
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
                    _id: 1,
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
            return result;
        } else {
            console.log("Error retrieving posts with images");
            return null;
        }
    },
    postLike: async (userId, postId) => {
        try {
          const post = await db.posts.findOne({ _id: objectId(postId) });
          if (!post) {
            console.log("no post found")
            return null;
          } else {
            const index = post.likes.indexOf(userId);
            let res;
            if (index === -1) {
              count = post.likes.push(userId);
              console.log(count);
              res = true;
            } else {
              post.likes.splice(index, 1);
              res = false;
            }
            const updatedPost = await post.save();
            return res;
          }
        } catch (err) {
          console.log(err)
          return null;
        }
        return post;
      }
}
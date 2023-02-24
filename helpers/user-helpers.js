const db = require('../app')
// const users = db.users
// const images = db.images
const collection = require('../config/collection')
const bcrypt = require('bcrypt');

var objectId = require('mongodb').ObjectId

module.exports = {
    doSignup: async (userData, imageData) => {
        userData.password = await bcrypt.hash(userData.password, 10);
        const result = await db.users.create(userData)
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
                        db.images.findOne({ uid: x }, 'data', function (err, image) {
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
            return user;
        } else {
            return null;
        }



    },
}
const state = {
    db: null
}

module.exports.connect =async function (done) {
    require('dotenv').config()

    const dbname = process.env.dbname;
    const mongodb = require('mongodb');
    const MongoClient = mongodb.MongoClient;

    const mongo_username = process.env.MONGO_USERNAME
    const mongo_password = process.env.MONGO_PASSWORD
    const uri = `mongodb+srv://irfanrasheedkc:${mongo_password}@cluster0.mznznpy.mongodb.net/?retryWrites=true&w=majority`;
    MongoClient.connect(uri, (err, data) => {
        if (err)
            return done(err);
        state.db = data.db(dbname);
        done();
    })
}

module.exports.get = function () {
    return state.db;
}
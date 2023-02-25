var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose')
// Set the strictQuery option to false to prepare for the upcoming change
mongoose.set('strictQuery', false);
const upload = require('express-fileupload')


var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

const cors = require("cors");
const { ObjectId } = require('mongodb');
const corsOptions = {
  origin: '*',
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors(corsOptions)) // Use this after the variable declaration

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(upload())

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


require('dotenv').config()

const mongo_username = process.env.MONGO_USERNAME
const mongo_password = process.env.MONGO_PASSWORD

const uri = `mongodb+srv://irfanrasheedkc:${mongo_password}@cluster0.mznznpy.mongodb.net/tellus?retryWrites=true&w=majority`;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
  if (err) console.log("Connection error" + err)
  else
    console.log("Database connected to port 27017");
})

const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String
});

module.exports.users = new mongoose.model("Users", userSchema);

const ImageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  data: {
    type: Buffer,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uid: {
    type: ObjectId,
    required: true
  }
});

module.exports.images = mongoose.model('Images', ImageSchema);

const postSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    ref: 'Users',
    required: true
  },
  datetime: {
    type: Date,
    default: Date.now() - (5.5 * 60 * 60 * 1000) // adjust to Indian time zone
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports.posts = new mongoose.model("Posts", postSchema);

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error')
  // res.render('error' , );
});

module.exports = app;
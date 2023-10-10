var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers.js');
const users = require('../app')

/* GET users listing. */
router.get('/', function (req, res, next) {

  data = {
    "api_status": "active"
  };
  res.json(data);
});

router.post('/signup', function (req, res) {
  userHelpers.doSignup(req.body, req.files).then((response) => {
    if(response==false)
      res.json({"signup" : false})
    else
      res.json({ "signup": true });
  })
})

router.post('/login', function (req, res) {
  userHelpers.doLogin(req.body).then((response) => {
    let result = { ...response };
    result.login = true;
    if (result._doc && result._doc.password) {
      delete result._doc.password;
    }
    if (response){
      console.log(result.login)
      res.json(result);}
    else
      res.json({ "login": false })
  })
})

router.post('/post', function (req, res) {
  userHelpers.doPost(req.body, req.files).then((response) => {
    // console.log(response)
    // response.post = true;
    // res.json(response)
      if(response)
      {
        response.post = true;
        res.json(response);
      }
      else
        res.json({"post":false})
  })
})

router.get('/post/:userId', function (req, res) {
  console.log(req.params.userId)
  userHelpers.getPost(req.params.userId).then((response) => {
    res.json(response)
  })
})

router.get('/profile/:userId' , function(req , res){
  userHelpers.getUserPost(req.params.userId).then((response)=>{
    res.json(response)
  })
})

router.post('/like' , function(req , res){
  console.log(req.body.userid)
  userHelpers.postLike(req.body.userid , req.body.postid).then((response)=>{
    res.json({"like":response})
  })
})
module.exports = router
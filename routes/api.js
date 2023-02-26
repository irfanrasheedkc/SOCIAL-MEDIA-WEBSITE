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
    console.log(response)
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
    console.log(result)
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
  console.log(req.body)
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

router.get('/post', function (req, res) {
  userHelpers.getPost().then((response) => {
    res.json(response)
  })
})


module.exports = router
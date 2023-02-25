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

router.post('/signup',  function (req, res) {
  userHelpers.doSignup(req.body , req.files).then((response) => {
    console.log(response)
    res.json({"signup":true});
  })
})

router.post('/login', function (req, res) {
  userHelpers.doLogin(req.body).then((response) => {
    let result = {...response};
    result.login = true;
    delete response._doc.password;
    console.log(result);
    if(response)
      res.json(result);
    else
      res.json({"login":false})
  })
})

router.post('/post', function (req, res) {
  console.log(req.body)
  userHelpers.doPost(req.body , req.files).then((response) => {
    res.json({"post":true})
  //   if(response)
  //   {
  //     response.post = true;
  //     res.json(response);
  //   }
  //   else
  //     res.json({"post":false})
  })
})


module.exports = router
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
    // let result  = [response].map(user=>user.toObject({gutter:true}));
    result.login = true;
    console.log(result);
    if(response)
      res.json(result);
    else
      res.json({"login":false})
  })
})


module.exports = router;

var express = require('express');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  data = {
    "api_status":"active"
  };
  res.json(data);
});

router.post('/signup', function (req, res) {
  userHelpers.doSignup(req.body).then((response) => {
    res.json({"Signup":"Success"});
  })
})

module.exports = router;

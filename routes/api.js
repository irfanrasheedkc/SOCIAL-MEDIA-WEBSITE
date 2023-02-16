var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  data = {
    "one":"two"
  };
  res.json(data);
});

module.exports = router;

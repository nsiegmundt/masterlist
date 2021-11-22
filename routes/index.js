var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Reset the song cache so it gets re-requested on refresh
  songCache = [];
  res.render('index', { title: 'Sieg\'s List' });
});

module.exports = router;

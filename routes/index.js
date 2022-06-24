var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var db = require('../db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());
app.use(cookieParser());
var ensureLoggedIn = ensureLogIn();


var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
	  if (!req.user) { return res.render('home'); }
  next();
}, function(req, res, next) {
  console.log(req.user.id)
  res.render('index', { user: req.user });
});
/* GET THE LIST OF HOMES*/
router.get('/homes-list', (req,res) => {
  db.all( "SELECT * FROM home WHERE owner_id = ?",[
    req.user.id
  ],
  function(err, rows) {
    if (err) { return next(err); }
    
    const home = rows.map(function(row) {
      return {
        location: row.location,
        for: row.for,
      }
      res.locals.homes = home;
    });
    res.render("index/homes-list")
  });
});
/*ADD NEW HOUSE*/
router.post('/addNewHouse', ensureLoggedIn ,(req,res , next) => {
  console.log(req.user.email);
  const owner = req.user;
  db.run('INSERT INTO home (owner_id,Location,for) VALUES( ? , ? , ? )',[
    req.user.id,
    req.body.location,
    req.body.for
  ],
  (err) => {
    if (err) { return console.error(err.message.at)}
  }),
  res.render('index');
  next();
});

// Get Sell Page
module.exports = router;

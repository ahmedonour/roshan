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

// function fetchData(req, res, next) {
//   db.all('SELECT rowid AS id, * FROM home WHERE owner_id = ?', [
//     req.user.id
//   ], function(err, rows) {
//     if (err) { return next(err); }
    
//     var todos = rows.map(unction req,res)
//     res.locals.todos = todos;
//     console.log(todos);
//     });
    
//     next();
//   };

				
function fetchTodos(req, res, next) {
  db.all('SELECT rowid AS id, * FROM home WHERE owner_id = ?', [
    req.user.id
  ], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        location: row.Location,
        four: row.four,
        space: row.space,
        bathrooms: row.bathrooms,
        bedrooms: row.bedrooms,
        price: row.price,
        url: '/' + row.id
      }
    });
    res.locals.todos = todos;

    next();
  });
}
// search homes sell
function findHomeforSell(req , res , next){
  const sell = "Sell";
  db.all("SELECT * FROM home WHERE four like ?", [
    sell
  ] ,function(err , rows){
    if (err) { return next(err);}
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        location: row.Location,
        four: row.four,
        space: row.space,
        bathrooms: row.bathrooms,
        bedrooms: row.bedrooms,
        price: row.price,
        url: '/' + row.id
      }
    });
    res.locals.todos = todos;
    console.log(todos)
    next();
  });
};
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchTodos,function(req, res, next) {
  // res.locals.filter = null;
  res.render('index', { user: req.user });
});
/* GET THE LIST OF HOMES*/
				

/*ADD NEW HOUSE*/
router.post('/addNewHouse', ensureLoggedIn ,(req,res , next) => {
  console.log(req.user.id);
  db.run('INSERT INTO home (owner_id,Location,four,space,bathrooms,bedrooms,price) VALUES( ? , ? , ? , ? ,? , ? , ? )',[
    req.user.id,
    req.body.location,
    req.body.for,
    req.body.space,
    req.body.bathrooms,
    req.body.bedrooms,
    req.body.price,
  ],

  (err) => {
    if (err) { return console.error(err.message)}
  }),
  res.redirect('/#house-list');
  next();
});

// Search For home
router.get('/buyHome', findHomeforSell , (req , res , next) => {
  res.redirect('/#buy');
  next();
});
module.exports = router;


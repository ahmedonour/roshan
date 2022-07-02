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

				
function fetchData(req, res, next) {
  db.all('SELECT rowid AS id, * FROM home WHERE owner_id = ?', [
    req.user.id
  ], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        location: row.loc,
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
  // const location = req.body.location
  const sell = "sell";
  // "SELECT * FROM home WHERE four like ? AND location = ? AND price BETWEEN ? AND ?;"
  db.all("SELECT * FROM home WHERE four like ?", [
    sell,
    // location,
    // req.body.min,
    // req.body.max
  ] ,function(err , rows){
    if (err) { return next(err);}
    var homes = rows.map(function(row) {
      return {
        id: row.id,
        location: row.loc,
        four: row.four,
        space: row.space,
        bathrooms: row.bathrooms,
        bedrooms: row.bedrooms,
        price: row.price,
        url: '/' + row.id
      }
    });
    res.locals.homes = homes;
   
    next();
  });
};

// search homes for rent
function findHomeforRent(req , res , next){
  const rent = "rent";
  db.all("SELECT * FROM home WHERE four like ?", [
    rent,
  ] ,function(err , rows){

    if (err) { return next(err);}
    var rent = rows.map(function(row) {
      return {
        id: row.id,
        loc: row.loc,
        four: row.four,
        space: row.space,
        bathrooms: row.bathrooms,
        bedrooms: row.bedrooms,
        price: row.price,
        url: '/' + row.id
      }
    });
	res.locals.rent = rent;
  //filter rent by location, min and max price
    res.locals.fillters = rent.filter(function(home){
      return home.loc === req.body.location;
    });
    console.log(res.locals.fillters)
    next();
  });

};

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchData,function(req, res, next) {
  // res.locals.filter = null;
  res.render('index', { user: req.user });
});
/* GET THE LIST OF HOMES*/
				

/*ADD NEW HOUSE*/
router.post('/addNewHouse', ensureLoggedIn ,fetchData,(req,res , next) => {
  db.run('INSERT INTO home (owner_id,loc,four,space,bathrooms,bedrooms,price) VALUES( ? , ? , ? , ? ,? , ? , ? )',[
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
router.get('/buyHome', ensureLoggedIn ,fetchData,findHomeforSell ,findHomeforRent , (req , res , next) => {
  
  res.render('buy', {user: req.user , namor: res.locals.homes , rent: res.locals.fillters});
  next();
});
router.post('/buyHome/fillter', ensureLoggedIn ,fetchData,findHomeforSell ,findHomeforRent , (req , res , next) => {
  res.redirect('/buyHome');
  next();
});

router.post('/rentHome/filter', ensureLoggedIn, fetchData,findHomeforSell ,findHomeforRent,function(req , res){
  res.redirect('/rentHome');
  next();
});


router.get('/rentHome', ensureLoggedIn, fetchData,findHomeforSell ,findHomeforRent,function(req , res){
	res.locals.rent = res.locals.rent.filter(function(home){
      return home.loc === req.body.location;
    });
	res.locals.filter = 'rentHome';
  res.render('rent', {user: req.user ,namor: res.locals.homes, rent: res.locals.fillters});
  next();
});

module.exports = router;
  

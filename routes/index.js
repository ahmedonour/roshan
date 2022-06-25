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
        four: row.for,
        space: row.space,
        bathrooms: row.bathrooms,
        bedrooms: row.bedrooms,
        price: row.price,
        url: '/' + row.id
      }
    });
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  });
}

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('home'); }
  next();
}, fetchTodos, function(req, res, next) {
  res.locals.filter = null;
  res.render('index', { user: req.user });
});
/* GET THE LIST OF HOMES*/
				
router.get('/active', ensureLoggedIn, fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
  res.locals.filter = 'active';
  res.render('index', { user: req.user });
});

router.get('/completed', ensureLoggedIn, fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
  res.locals.filter = 'completed';
  res.render('index', { user: req.user });
});

/*ADD NEW HOUSE*/
router.post('/addNewHouse', ensureLoggedIn ,(req,res , next) => {
  console.log(req.user.id);
  const owner = req.user;
  db.run('INSERT INTO home (owner_id,Location,for,space,bathrooms,bedrooms,price) VALUES( ? , ? , ? , ? ,? , ? , ? )',[
    req.user.id,
    req.body.location,
    req.body.for,
    req.body.space,
    req.body.bathrooms,
    req.body.bedrooms,
    req.body.price,
  ],
  (err) => {
    if (err) { return console.error(err.message.at)}
  }),
  res.redirect('/');
  next();
});

// Get Sell Page
module.exports = router;


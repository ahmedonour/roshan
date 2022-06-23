var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var cookieParser = require('cookie-parser');
var csrf = require('csurf');
var db = require('../db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
// app.use(csrf());
// app.use(function(req, res, next) {
//   const token = req.csrfToken();
//   res.locals.csrfToken = token;
//   next();
// }
//   );
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
var ensureLoggedIn = ensureLogIn();

function fetchTodos(req, res, next) {
  db.all('SELECT rowid AS id, * FROM houses WHERE owner_id = ?', [
    req.user.id,
    req.user.first_name
  ], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
      return {
        id: row.id,
        title: row.title,
        completed: row.completed == 1 ? true : false,
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
router.get('/homes-list', (req,res) => {
  const homeList = "SELECT * FROM home WHERE owner_id = ?";
  db.all(homeList,[
    req.user.id
  ],
  (err , rows) =>{
    if (err) {
      return console.error(err.message);
    }
    res.render("index/#house-list" , {module: rows})
  });
});
/*ADD NEW HOUSE*/
router.post('/addNewHouse', ensureLoggedIn ,(req,res , next) => {
	// const loc = req.body.location;
	// const toWhat = req.body.for; 
  console.log(req.body.location);
  const owner = 5;
  db.run('INSERT INTO home (owner_id,Location,for) VALUES( ? , ? , ? )',[
    owner,
    req.body.location,
    req.body.for
  ],);
  // (err) => {
  //   if (err) { return console.error(err.message.at)}
  // }),
  res.render('index');
  next();
});

// Get Sell Page
module.exports = router;

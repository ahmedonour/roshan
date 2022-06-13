var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var db = require('../db');

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
router.get('/homes-list', (res,req) => {
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
router.post('/add-new-house', ensureLoggedIn ,(res,req) => {
	const loc = req.body.location;
	const toWhat = req.body.for; 
  db.run('INSERT INTO home (owner_id,Location,for) VALUE( ? , ? , ? )',[
    req.user.id,
    req.body.location,
    req.body.for
  ],
  (err) => {
    if (err) { return console.error(err.message.at)}
  }),
  res.render('index');
});
// router.get('/active', ensureLoggedIn, fetchTodos, function(req, res, next) {
//   res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
//   res.locals.filter = 'active';
//   res.render('index', { user: req.user });
// });

// router.get('/completed', ensureLoggedIn, fetchTodos, function(req, res, next) {
//   res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
//   res.locals.filter = 'completed';
//   res.render('index', { user: req.user });
// });

// router.post('/', ensureLoggedIn, function(req, res, next) {
//   req.body.title = req.body.title;
//   next();
// }, function(req, res, next) {
//   if (req.body.title !== '') { return next(); }
//   return res.redirect('/' + (req.body.filter || ''));
// }, function(req, res, next) {
//   db.run('INSERT INTO houses (owner_id, discription, photo, completed) VALUES (?, ?, ?, ?)', [
//     req.user.id,
//     req.body.discription,
//     req.body.file,
//     req.body.completed == true ? 1 : null
//   ], function(err) {
//     if (err) { return next(err); }
//     return res.redirect('/' + (req.body.filter || ''));
//   });
// });

// router.post('/:id(\\d+)', ensureLoggedIn, function(req, res, next) {
//  req.body.title = req.body.title.trim();
//  next();
// }, function(req, res, next) {
//  if (req.body.title !== '') { return next(); }
//  db.run('DELETE FROM houses WHERE rowid = ? AND owner_id = ?', [
//    req.params.id,
//    req.user.id
//  ], function(err) {
//    if (err) { return next(err); }
//    return res.redirect('/' + (req.body.filter || ''));
//  });
// }, function(req, res, next) {
//  db.run('UPDATE houses SET title = ?, completed = ? WHERE rowid = ? AND owner_id = ?', [
//    req.body.title,
//    req.body.completed !== undefined ? 1 : null,
//    req.params.id,
//    req.user.id
//  ], function(err) {
//    if (err) { return next(err); }
//    return res.redirect('/' + (req.body.filter || ''));
//  });
// });

// router.post('/:id(\\d+)/delete', ensureLoggedIn, function(req, res, next) {
//  db.run('DELETE FROM houses WHERE rowid = ? AND owner_id = ?', [
//    req.params.id,
//    req.user.id
//  ], function(err) {
//    if (err) { return next(err); }
//    return res.redirect('/' + (req.body.filter || ''));
//  });
// });

// router.post('/toggle-all', ensureLoggedIn, function(req, res, next) {
//  db.run('UPDATE houses SET completed = ? WHERE owner_id = ?', [
//    req.body.completed !== undefined ? 1 : null,
//    req.user.id
//  ], function(err) {
//    if (err) { return next(err); }
//    return res.redirect('/' + (req.body.filter || ''));
//  });
// });

// router.post('/clear-completed', ensureLoggedIn, function(req, res, next) {
//  db.run('DELETE FROM houses WHERE owner_id = ? AND completed = ?', [
//    req.user.id,
//    1
//  ], function(err) {
//    if (err) { return next(err); }
//    return res.redirect('/' + (req.body.filter || ''));
//  });
// });
// Get Sell Page
module.exports = router;

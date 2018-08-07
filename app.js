const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const promisify = require('es6-promisify');
const flash = require('connect-flash');
const expressValidator = require('express-validator');
const routes = require('./routes/index');
const helpers = require('./helpers');
const errorHandlers = require('./handlers/errorHandlers');
const authCtrl = require('./controllers/authController');
require('./handlers/passport');

// create Express app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'pug');

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// add validation methods to the req
app.use(expressValidator());

//
app.use(cookieParser());

// 
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

//
app.use(passport.initialize());
app.use(passport.session());

// 
app.use((req, res, next) => {
  req.login = promisify(req.login.bind(req));
  next();
});

//
app.use(flash());

// global variables
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;
  res.locals.currentPath = req.path;

  let checkRights = (accessList) => req.user && accessList.includes(req.user.role);
  res.locals.checkRights = checkRights;
  res.checkRights = checkRights;
  
  next();
});


//
app.use('/', routes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// handle mongoDB errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);



module.exports = app;
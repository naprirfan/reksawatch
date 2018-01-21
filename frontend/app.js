'use strict';

// Main starting point of the application
// TODO: ensure HTTPS
const express = require('express');
const app = express();
const config = require('./config');
const router = require('./router');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('req-flash');

// App Setup
app.use(session({
  secret: config.SESSION_SECRET,
  cookie: {maxAge: 86400000},
  resave: false,
  saveUninitialized: false
}));
app.set('view engine', 'pug');
app.use('/assets', express.static('assets'));
app.use(morgan('combined'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
router(app);

// Error Handler
app.use(function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  // handle CSRF token errors here
  return res.status(403).send('form tampered');
});

// Fire up server
var server = app.listen(config.PORT || 8081, function() {
  console.log('listening to port', config.PORT || 8081);
});

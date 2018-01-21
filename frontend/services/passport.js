const passport = require('passport');
const LocalStrategy = require('passport-local');
const config = require('../config');
const request = require('request');

// Create local strategy
const localOption = { usernameField: 'email' }
const API_BASE_URL = config.API_BASE_URL;
const localLogin = new LocalStrategy(localOption, function(email, password, done) {

  const postOption = {
    url: API_BASE_URL + '/signin',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      password: password
    })
  };

  request.post(postOption, function(error, response, body){
    // If response OK
    if(!error && response.statusCode === 200) {

      return done(null, body);
    }

    return done(error)

  });

});

// Tell passport to use this strategy
passport.use(localLogin);

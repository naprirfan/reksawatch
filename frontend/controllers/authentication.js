const config = require('../config');
const API_BASE_URL = config.API_BASE_URL;
const request = require('request');
const flash = require('req-flash');

exports.getSigninPage = function(req, res, next) {
  console.log(req.flash());
  return res.render('signin', { csrfToken: req.csrfToken(), flash: req.flash() });
}

exports.getSignupPage = function(req, res, next) {
  return res.render('signup', {csrfToken: req.csrfToken()})
}

exports.doSignin = function(req, res, next) {
  return res.redirect('/rekomendasi');
}

exports.doSignup = function(req, res, next) {

  const postOption = {
    url: API_BASE_URL + '/signup',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: req.body.email,
      password: req.body.password
    })
  };

  request.post(postOption, function(error, response, body){
    // If response OK
    if(!error && response.statusCode === 200) {
      return res.redirect('/account_need_activation/' + req.body.email);
    }

    // Error when retrieving data
    return res.end(error);
  });
}

exports.doSignout = function(req, res, next) {
  req.logout();
  return res.redirect('/');
}

/*
TODO:

1. Signup + Activation Mail
2. Forgot Password
3. Reset Password
4. Resend activation mail

*/

const config = require('../config');
const API_BASE_URL = config.API_BASE_URL;
const request = require('request');

exports.getIndexPage = function(req, res, next) {

  const userSession = JSON.parse(req.session.passport.user);

  const getOption = {
    url: API_BASE_URL + '/get_recommendation',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userSession.token
    }
  };

  request.get(getOption, function(error, response, body){
    // If response OK
    if(!error && response.statusCode === 200) {
      return res.render('recommendation', {
        user: 1,
        env: config.ENV
      });
    }

    // Error when retrieving data
    return res.render('recommendation', {user: 1})

  });

}

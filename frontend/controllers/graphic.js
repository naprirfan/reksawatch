const config = require('../config');
const API_BASE_URL = config.API_BASE_URL;
const request = require('request');

exports.getGraphicData = function(req, res, next) {

  const userSession = JSON.parse(req.session.passport.user);

  const getOption = {
    url: API_BASE_URL + '/get_data_for_graphic',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userSession.token
    }
  };

  request.get(getOption, function(error, response, body){
    // If response OK
    if(!error && response.statusCode === 200) {
      return res.json(body);
    }

    // Error when retrieving data
    return res.end('error')

  });

}

exports.getMutualFundList = function(req, res, next) {


  const userSession = JSON.parse(req.session.passport.user);

  const getOption = {
    url: API_BASE_URL + '/get_mutual_fund_list',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': userSession.token
    }
  };

  request.get(getOption, function(error, response, body){
    // If response OK
    if(!error && response.statusCode === 200) {
      return res.json(body);
    }

    // Error when retrieving data
    return res.end('error')

  });
}

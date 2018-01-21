// TODO: create dashboard to override current price, in new service (PHP MY ADMIN will do for now)
const request = require('request');
const cheerio = require('cheerio');
const config = require('../config');
const helper = require('../helper');
const ihsg_analyzer = require('../ihsg_analyzer');
const reksadana_analyzer = require('../reksadana_analyzer');
const PriceModel = require('../models/price');
const NAVModel = require('../models/mutual_fund_nav');

const INFOVESTA_BASE_URL = 'https://www.infovesta.com/index/mutualfund/SH/2?_=1490571849306';
const INDOPREMIER_COMPOSITE_URL = 'https://www.indopremier.com/module/saham/include/json-charting.php?code=COMPOSITE&start='+ helper.getFormattedTodayDate('mm/dd/yyyy') +'&end=' + helper.getFormattedTodayDate('mm/dd/yyyy');

exports.getRecommendation = function(req, res, next) {

  function getLatestPrice() {
    console.log('Get recommendation controller: get latest price');

    var query = PriceModel.find({});
    query.limit(1);
    query.sort('-date');

    query.exec(function (err, prices) {
      if (err) return false;

      return prices[0];
    });
  }

  const redisClient = req.app.get('redisClient');
  const rediskey = 'stock_api_call-?start=' + helper.getFormattedTodayDate('mm/dd/yyyy') +'&end=' + helper.getFormattedTodayDate('mm/dd/yyyy');

  redisClient.get(rediskey, function(error, result) {

    if (result && config.ENV == 'PRODUCTION') {
      console.log('fetching through Redis');

      return res.json(JSON.parse(result));

    } else {

      // Check if now is the time to take closing price
      var d = new Date();
      var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
      var nd = new Date(utc + (3600000*7));
      var h = nd.getHours();
      var isTradingAlreadyClosed = (h >= 17 && h <= 23);

      if (helper.isNowWeekend() || !isTradingAlreadyClosed) {
        if (helper.isNowWeekend()) console.log('now is weekend');
        if (!isTradingAlreadyClosed) console.log('not in trading hours')

        var result = getLatestPrice();
        if (result) return res.json(result);
        return res.json({error: 1, message: "Error when retrieving data"});
      }

      console.log('Requesting data to indopremier');

      // GET todays IHSG price
      request.get({url: INDOPREMIER_COMPOSITE_URL}, function(error, response, todaysPrice){

        // If response OK
        if(!error && response.statusCode === 200) {

          // Handle if indopremier doesnt return value, then get latest price
          var todaysPriceArr = JSON.parse(todaysPrice);
          console.log(INDOPREMIER_COMPOSITE_URL);
          if (!todaysPriceArr.length) {
            console.log('indopremier doesnt return any value');
            var result = getLatestPrice();
            if (result) return res.json(result);
            return res.json({error: 1, message: "Error when retrieving data"});
          }
          else {

            console.log('indopremier return value. analyze it with retrieved value from DB');

            // Fetch 200 days earlier price from DB
            var query = PriceModel.find({});
            query.limit(200);
            query.sort('-date');

            query.exec(function (err, prices) {

              // Calculate todays recommendation
              var pricesArr = prices.map(function(item) {
                return item.price;
              });
              var priceToday = todaysPriceArr[0][4];
              pricesArr.unshift(priceToday);

              var analysisResult = ihsg_analyzer.analyzeTrend(pricesArr);
              analysisResult.start_date = helper.getFirstDayInLastYearFullFormat();
              analysisResult.end_date = new Date();

              // Save calculation result to DB
              var dataTobeSavedToDB = [{
                date: new Date(),
                price: analysisResult.today.price,
                ema30: analysisResult.today.ema30,
                sma60: analysisResult.today.ma60,
                sma200: analysisResult.today.ma200,
                recommendation: analysisResult.recommendation,
                recommendation_type: analysisResult.recommendation_type
              }];

              console.log('about to save to DB and redis...');
              // Return calculation result as JSON
              PriceModel.collection.insert(dataTobeSavedToDB, function(err, docs) {
                if (err) return res.json({error: 1, message: err});

                // Save to redis
                redisClient.set(rediskey, JSON.stringify(dataTobeSavedToDB));

                console.log('data saved to DB and redis');

                return res.json(dataTobeSavedToDB);
              });
            });// End of query

          }// end of if indopremier doesnt return value

        }
        else {
          return res.json({error: 1, message: "Error when retrieving data"});
        }

      });// end of request

    }// end of if clause

  });

};

exports.getDataForGraphic = function (req, res, next) {
  const redisClient = req.app.get('redisClient');

  redisClient.get('GRAPHIC_DATA_ON_' + helper.getFormattedTodayDate(), function(error, result) {
    if (result && config.ENV == 'PRODUCTION') {
      console.log('Graphic data: fetching through Redis');

      return res.json(JSON.parse(result));

    } else {

      PriceModel
        .find({"date": { "$gte": (helper.getFirstDayInLastYearFullFormat()) }})
        .sort("date")
        .exec(function(err, docs) {
          if (err) return next(err);

          // Save to redis
          redisClient.set('GRAPHIC_DATA_ON_' + helper.getFormattedTodayDate(), JSON.stringify(docs));

          return res.json(docs);
        });

    }

  });
}

exports.getMutualFundList = function(req, res, next) {

  const redisClient = req.app.get('redisClient');
  const rediskey = INFOVESTA_BASE_URL + helper.getFormattedTodayDate();

  redisClient.get(rediskey, function(error, result) {
    if (result && config.ENV == 'PRODUCTION') {
      console.log('Mutual fund list: fetching through Redis');

      return res.json(JSON.parse(result));

    } else {

      request.get({url: INFOVESTA_BASE_URL}, function(error, response, body){

        // If response OK
        if(!error && response.statusCode === 200) {

          var $ = cheerio.load(body);
          var tbody = [];
          var dataFromInvofesta = [];

          $('table tbody').children().each(function() {
            var obj = [];
            $(this).children().each(function() {
              obj.push($(this).text());
            });
            tbody.push(obj);

            // DB entry
            var entry = {
              date: new Date(),
              name: obj[1],
              nav: Number(obj[2]),
              // INFO: in case needed in the future
              // one_day_delta: Number(obj[4]),
              // one_month_delta: Number(obj[5]),
              one_year_delta: Number(obj[6]),
              three_years_delta: Number(obj[7])
            };

            dataFromInvofesta.push(entry);

          });// End of table tbody loop

          // Add rank for each mutual fund
          var dataTobeSavedToDB = reksadana_analyzer.addRank(dataFromInvofesta);

          NAVModel.collection.insert(dataTobeSavedToDB, function(err, docs) {
            if (err) return res.json({error: 1, message: err});

            // Save to redis
            redisClient.set(rediskey, JSON.stringify(dataTobeSavedToDB));

            return res.json(dataTobeSavedToDB);
          });

        }
        else {
          return res.json({error: 1, message: "Error when retrieving data"});
        }

      });
    }

  });
}

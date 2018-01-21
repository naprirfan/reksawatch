var csv = require('csv-parser');
var fs = require('fs');
var PriceModel = require('../models/price');

exports.initJKSEPrice = function(req, res, next) {

  PriceModel.collection.drop();

  var prices = [];

  fs.createReadStream('./seed/reksadana_seed_db.csv')
    .pipe(csv())
    .on('data', function (data) {
      var obj = {
        date: ( new Date(data.Date) ),
        price: data.Close,
        ema30: data.EMA30,
        sma60: data.SMA60,
        sma200: data.SMA200,
        recommendation: ''
      }
      prices.push(obj);
    })
    .on('end', function() {

      PriceModel.collection.insert(prices, function(err, docs) {
        if (err) return next(err);

        return res.end("We're done.");
      });

    });
}

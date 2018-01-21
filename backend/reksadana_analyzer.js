// Analysis tools related to mutual funds
module.exports = {
  /*
  @method: addRank
  @overview: Extend data with rank compared to other mutual funds

  @params: data (array of object)
  [{
    date: new Date(),
    name: obj[1],
    nav: Number(obj[2]),
    one_day_delta: Number(obj[4]),
    one_month_delta: Number(obj[5]),
    one_year_delta: Number(obj[6]),
    three_years_delta: Number(obj[7])
  }]

  @return: data that being extended with rank for each mutual fund (array of object).
  [{
    date: new Date(),
    name: obj[1],
    nav: Number(obj[2]),
    one_day_delta: Number(obj[4]),
    one_month_delta: Number(obj[5]),
    one_year_delta: Number(obj[6]),
    three_years_delta: Number(obj[7])
    rank: 1...n
  }]

  */
  addRank: function(data) {
    return data;
  },

  /*
  @overview: update beta value for each mutual fund. Should be in cron job
  possible source: http://www.bareksa.com/id/data/reksadana/11/axa-citradinamis
  */
  updateBeta: function() {

  },

  /*
  @overview: update AUM value for each mutual fund. Should be in cron job
  possible source: http://www.bareksa.com/id/data/reksadana/11/axa-citradinamis
  */
  updateAUM: function() {

  }
}

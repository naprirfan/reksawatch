// Technical analysis related functions only.
// Underscore prefix means the method is related to cross line calculation
module.exports = {

  // Starting day: 0 = today; 1 = yesterday; 2 = the day before yesterday; n = today - n day
  getMovingAverage: function(data, numberOfDay, startingDay) {
    startingDay = startingDay || 0;
    var sum = 0;

    for (var i = startingDay; i < numberOfDay + startingDay; i++) {
      // if out of bound, return null
      if (!data[i]) return null;

      sum += data[i];
    }

    return sum / numberOfDay;
  },

  getExponentialMovingAverage: function(data, numberOfDay) {
    // Setup constants
    var smoothingConstant = 2 / (numberOfDay + 1);

    // Calculate initial EMA
    var initialEMA = 0;
    for (var i = numberOfDay; i < numberOfDay * 2; i++) {
      // if out of bound, return null
      if (!data[i]) return null;

      initialEMA += data[i];
    }
    initialEMA = initialEMA / numberOfDay;

    var result = [initialEMA];
    for (var i = numberOfDay - 1; i >= 0; i--) {
      var currentPrice = data[i];
      var latestEMA = result[result.length - 1];
      var newEMA = smoothingConstant * (currentPrice - latestEMA) + latestEMA;
      result.push(newEMA);
    }

    return result;
  },

  // Is crossing input :
  // function([Point A yesterday, Point A today], [Point B yesterday, Point B today]);
  // https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
  // https://martin-thoma.com/html5/line-segment-intersection/line-segment-intersection.js
  _isCrossing: function(a, b) {
    // Create new point
    const x1 = 1000;
    const x2 = 2000;
    var newA = {
      "first": {
        x: x1,
        y: a[0]
      },
      "second": {
        x: x2,
        y: a[1]
      }
    };
    var newB = {
      "first": {
        x: x1,
        y: b[0]
      },
      "second": {
        x: x2,
        y: b[1]
      }
    };

    return (this._doBoundingBoxesIntersect(a, b) && this._lineSegmentTouchesOrCrossesLine(newA, newB), this._lineSegmentTouchesOrCrossesLine(newB, newA));
  },

  _doBoundingBoxesIntersect: function(a, b) {
    return (a[0] <= b[1] && a[1] >= b[0]);
  },

  _lineSegmentTouchesOrCrossesLine: function (a, b) {
      return this._isPointOnLine(a, b.first)
              || this._isPointOnLine(a, b.second)
              || (this._isPointRightOfLine(a, b.first) ^ this._isPointRightOfLine(a,
                      b.second));
  },

  _crossProduct: function (a, b) {
    return a.x * b.y - b.x * a.y;
  },

  _isPointOnLine: function (a, b) {
    const EPSILON = 0.000001
    // Move the image, so that a.first is on (0|0)
    var aTmp = {"first":{"x":0, "y":0}, "second":{"x":a.second.x - a.first.x, "y":a.second.y - a.first.y}};
    var bTmp = {"x":b.x - a.first.x, "y":b.y - a.first.y};
    var r = this._crossProduct(aTmp.second, bTmp);
    return Math.abs(r) < EPSILON;
  },

  _isPointRightOfLine: function (a, b) {
    // Move the image, so that a.first is on (0|0)
    var aTmp = {"first":{"x":0, "y":0}, "second":{"x":a.second.x - a.first.x, "y":a.second.y - a.first.y}};
    var bTmp = {"x":b.x - a.first.x, "y": b.y - a.first.y};
    return this._crossProduct(aTmp.second, bTmp) < 0;
  },

  analyzeTrend: function(data) {

    var ema30 = this.getExponentialMovingAverage(data, 30);

    var today = {
      ema30: ema30[ema30.length - 1],
      ma60: this.getMovingAverage(data, 60),
      ma200: this.getMovingAverage(data, 200),
      price: data[0]
    };

    var yesterday = {
      ema30: ema30[ema30.length - 2],
      ma60: this.getMovingAverage(data, 60, 1),
      ma200: this.getMovingAverage(data, 200, 1),
      price: data[1]
    }

    // Initialize recommendation
    var recommendation = "";
    var recommendation_type = "DONT_BUY";
    if (
      this._isCrossing([yesterday.price, today.price], [yesterday.ema30, today.ema30]) ||
      this._isCrossing([yesterday.price, today.price], [yesterday.ma60, today.ma60]) ||
      this._isCrossing([yesterday.price, today.price], [yesterday.ma200, today.ma200])
      )
    {
      if (today.ema30 > today.ma60 && today.ma60 > today.ma200) {
        recommendation_type = "STRONG_BUY";
        recommendation = "Saat yang baik untuk top up Reksadana Saham! Indeks bertemu titik resisten dan tren sedang naik.";
      }
      else if (today.ema30 > today.ma200 && today.ma200 > today.ma60) {
        recommendation_type = "RISKY_BUY";
        recommendation = "Boleh top up Reksadana Saham hari ini, tapi mungkin bukan di harga terbaik. Indeks memang bertemu titik resisten namun momentum pasar belum sepenuhnya terkonfirmasi naik.";
      }
      else {
        recommendation = "Indeks bertemu titik resisten, namun momentum pasar sedang negatif. Kemungkinan besar bisa dapat harga yang lebih baik di lain waktu.";
      }
    }
    else {

      const uptrend_copy = [
        "Momentum masih naik, namun belum ada kesempatan membeli di harga bawah. Enjoy the ride saja.",
        "Belum ada kesempatan membeli di harga terbaik, walaupun saat ini momentum masih naik.",
        "Saat ini momentum masih naik, namun belum ada kesempatan membeli di harga terbaik.",
        "Walaupun trend sedang naik, namun belum ada kesempatan membeli di harga terbaik.",
        "Saat ini belum ada kesempatan untuk membeli di harga terbaik, walaupun momentum sedang naik."
      ];

      const downtrend_copy = [
        "Momentum sedang turun dan indeks belum menyentuh titik resisten. Lebih baik santai saja hari ini.",
        "Trend sedang turun dan belum menyentuh titik resisten. Lebih baik tunggu saja.",
        "Lebih baik santai saja hari ini. Saat ini momentum sedang turun dan belum juga menyentuh titik resisten.",
        "Lebih baik tunggu kesempatan yang lebih OK di lain waktu. Saat ini trend sedang turun dan belum juga menyentuh titik resisten.",
        "Sebaiknya santai saja hari ini. Momentum sedang turun dan belum menyentuh titik resisten."
      ];

      if (today.ema30 > today.ma60 && today.ma60 > today.ma200) {
        recommendation = uptrend_copy[Math.floor(Math.random() * uptrend_copy.length)];
      }
      else {
        recommendation = downtrend_copy[Math.floor(Math.random() * downtrend_copy.length)];
      }
    }

    return {
      error: 0,
      recommendation: recommendation,
      recommendation_type: recommendation_type,
      today: today,
      yesterday: yesterday
    }
  }
}

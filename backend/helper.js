module.exports = {
  _formatDate: function(thedate, format) {
    var dd = thedate.getDate();

    // INFO: January is 0!
    var mm = thedate.getMonth() + 1;
    var yyyy = thedate.getFullYear();

    if(dd < 10) {
      dd = '0' + dd;
    }

    if(mm < 10) {
        mm = '0' + mm;
    }

    // Formatting
    var result = '';
    switch(format) {
      case 'mm/dd/yyyy':
        result = mm + '/' + dd + '/' + yyyy;
        break;
      default:
        result = yyyy + '-' + mm + '-' + dd;
        break;
    }

    return result;
  },

  isNowWeekend: function() {
    var today = new Date();
    return (today.getDay() == 6 || today.getDay() == 0);
  },

  getFirstDayInLastYear: function() {
    var today = new Date();
    var modifiedDate = new Date(today.getFullYear() - 1, 0, 1);
    return this._formatDate(modifiedDate);
  },

  getFirstDayInLastYearFullFormat: function() {
    var today = new Date();
    var modifiedDate = new Date(today.getFullYear() - 1, 0, 1);
    return modifiedDate;
  },

  getFormattedTodayDate: function(format) {
    return this._formatDate(new Date(), format);
  },

  sanitizeQuandlData: function(rawdata) {
    var columnNames = rawdata.column_names;
    var adjustedCloseIndex = columnNames.indexOf("Close");

    return rawdata.data.map(function(entry) {
      return entry[adjustedCloseIndex];
    });
  },

  sanitizeGoogleData: function(rawdata) {
    var mapped = rawdata.map(function(item) {
      return item.close;
    });

    return mapped.sort(function(a, b) {
      return a > b;
    })
  }
}

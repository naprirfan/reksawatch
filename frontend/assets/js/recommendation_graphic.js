$(document).ready(function() {

  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  var today = year + "-" + month + "-" + day;
  var isProduction = $('.js-env').val() === 'PRODUCTION';

  $.ajax({
    url: '/get_data_for_graphic',
    method: 'GET',
    success: function(response) {
      result = JSON.parse(response);
      if (result.error) return alert(result.message);

      // TODO: implement cache
      if (typeof Storage !== undefined) {
        localStorage.clear()
        localStorage.setItem('graphic_data_on_' + today, response);
      }

      var todaysData = result[result.length - 1];
      var lastUpdatedAt = todaysData.date;
      var formattedDate = formatDate(new Date(lastUpdatedAt));

      $('.js-recommendation').text(todaysData.recommendation);
      $('.js-last-updated-at').text(' ' + formattedDate);

      drawGraphic(result);

      $('.js-loader-historical-graphic').remove()
    },
    error: function(err) {
      alert(err)
    }
  });

  function formatDate(thedate, format) {
    var dd = thedate.getDate();

    // INFO: January is 0!
    var mm = thedate.getMonth();
    var mmLookup = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    var yyyy = thedate.getFullYear();

    if(dd < 10) {
      dd = '0' + dd;
    }

    // Formatting
    return dd + '-' + mmLookup[mm] + '-' + yyyy;
  }

  // if (typeof Storage !== undefined && localStorage.getItem('graphic_data_on_' + today) && isProduction) {
  //   drawGraphic(JSON.parse(localStorage.getItem('graphic_data_on_' + today)));
  // }
  // else {
  // draw graphic
  // }

  function drawGraphic(data) {
    // Define constants
    const BREAKPOINT = 780;

    // Define body width
    var body_width = parseInt(d3.select('body').style('width').replace('px',''));

    // Define chart margin, width, height
    var margin = {top: 50, right: 50, bottom: 30, left: 30}
    var width = body_width - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom;

    // Initiate SVG graph
    var svg = d3.select(".js-historical-graphic").append('svg')
      .attr("width", "100%")
      .attr("height", height)
      .attr("class", "chart")
      .attr('viewBox','0 0 '+width+' '+ (height + margin.top + margin.bottom));

    // Define price and dates
    var prices = [];
    var dates = [];
    for (var i = 0; i < data.length; i++) {
      prices.push(data[i].price);
      dates.push(data[i].date);
    }

    // draw yAxis
    var yAxisScale = d3.scaleLinear()
      .domain([3500, d3.max(d3.values(prices))])
      .range([height, 0]);

    var yAxis = d3.axisLeft()
      .scale(yAxisScale)

    svg.append('g').attr("class", "axis_text").call(yAxis);

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -60)
      .attr("y", 20)
      .attr("class", "axis_text")
      .text("Harga");

    // draw xAxis
    var mindate = new Date(dates[0]);
    var maxdate = new Date(dates[dates.length - 1]);
    var xAxisScale = d3.scaleTime()
      .domain([mindate, maxdate])
      .range([0, width]);

    var xAxis = d3.axisBottom()
      .scale(xAxisScale);

    // adjust ticks on narrower screens
    if (window.innerWidth < BREAKPOINT) xAxis.ticks(7);

    svg.append('g')
      .attr("class", "axis_text")
      .attr("transform", "translate(-6," + (height) + ")")
      .call(xAxis);

    // draw bars
    var bargroup = svg.selectAll("g")
      .data(data.reverse())
      .enter()
      .append("g")
      .attr("class", "item");

    // draw price
    bargroup.append("rect")
      .attr("x", function(d){
        return xAxisScale(new Date(d.date));
      })
      .attr("y", function(d){
        return yAxisScale(d.price);
      })
      .attr("width", 80)
      .attr("height", function(d){
        return height - yAxisScale(d.price);
      })
      .attr("fill", function(d) {
        return "#FFE381";
      });

    // draw ema30
    bargroup.append("rect")
      .attr("x", function(d){
        return xAxisScale(new Date(d.date));
      })
      .attr("y", function(d){
        return yAxisScale(d.ema30);
      })
      .attr("width", 80)
      .attr("height", function(d){
        return height - yAxisScale(d.ema30);
      })
      .attr("fill", function(d) {
        return "#64B6AC";
      });

    // draw sma60
    bargroup.append("rect")
      .attr("x", function(d){
        return xAxisScale(new Date(d.date));
      })
      .attr("y", function(d){
        return yAxisScale(d.sma60);
      })
      .attr("width", 80)
      .attr("height", function(d){
        return height - yAxisScale(d.sma60);
      })
      .attr("fill", function(d) {
        return "#CC2936";
      });

    // draw sma200
    bargroup.append("rect")
      .attr("x", function(d){
        return xAxisScale(new Date(d.date));
      })
      .attr("y", function(d){
        return yAxisScale(d.sma200);
      })
      .attr("width", 80)
      .attr("height", function(d){
        return height - yAxisScale(d.sma200);
      })
      .attr("fill", function(d) {
        return "#643173";
      });

  }

});

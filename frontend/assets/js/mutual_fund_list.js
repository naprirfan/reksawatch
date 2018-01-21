$(document).ready(function() {

  var hideLoader = function() {
    $('.js-loader-mutual-fund-list').hide()
  }

  $.ajax({
    url: '/get_mutual_fund_list',
    method: 'GET',
    success: function(response) {
      var res = JSON.parse(response);

      if (res && res.error === 1) {
        hideLoader();
        $('.js-mutual-fund-list').text('Maaf, data belum tersedia.');
        return;
      }

      // Create table
      var table = $('<table class="uk-table"></table>');

      // Append THEAD
      var thead = $('<thead></thead>');
      var tr_head = $('<tr></tr>');
      var tr_head_text = [
        'No',
        'REKSA DANA',
        'NAB',
        '1 TH(%)',
        '3 TH(%)',
        'RANKING <span uk-icon="icon: question" title="Ranking reksadana diambil berdasarkan nilai ROI, beta, AUM, dan Inception Date." uk-tooltip></span>'
      ];

      for (var i = 0; i < tr_head_text.length; i++) {
        var th = $("<th></th>");
        th.html(tr_head_text[i]);
        th.appendTo(tr_head);
      }

      tr_head.appendTo(thead);
      thead.appendTo(table);

      // Append TBODY
      var tbody = $('<tbody></tbody>');
      for (var i = 0; i < res.length; i++) {
        var tr_body = $('<tr></tr>');
        var entry = res[i];

        var td1 = $("<td>"+ (i + 1) +"</td>");
        var td2 = $("<td>"+ entry.name +"</td>");
        var td3 = $("<td>"+ entry.nav +"</td>");
        var td4 = $("<td>"+ entry.one_year_delta +"</td>");
        var td5 = $("<td>"+ entry.three_years_delta +"</td>");

        var starlength = entry.rank ? entry.rank : 0;
        var star = '';
        for (var j = 0; j < starlength; j++) star += '<span uk-icon="icon: star"></span>';
        var td6 = $("<td>"+ (star ? star : 'N/A') +"</td>");

        td1.appendTo(tr_body);
        td2.appendTo(tr_body);
        td3.appendTo(tr_body);
        td4.appendTo(tr_body);
        td5.appendTo(tr_body);
        td6.appendTo(tr_body);

        tr_body.appendTo(tbody);

      }

      tbody.appendTo(table);

      // Append table to container
      table.appendTo('.js-mutual-fund-list');

      hideLoader();

    },
    error: function(err) {
      alert(err)
    }
  })
});

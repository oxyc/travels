(function ($, _) {
  'use strict';

  var $charts = $('.expenditure-chart');
  if ($charts.length) {
    $.getJSON('/expenditures.json', init);
  }

  var tagsHidden = ['flight', 'boat'];

  var tripDate;
  var tagTotalData = {};

  var chartTypes = {
    perTagCPD: function ($el, data, options) {
      var duration = calculateTotalDuration(options.countryData);
      duration = duration[options.country];

      var series = _.chain(data)
        .groupBy('tags')
        .map(function (tagData, tag) {
          var amount = _.sum(tagData, 'amount');
          amount = Math.round(amount / duration * 100) / 100;
          return {name: tag, y: amount};
        })
        .value();

      $el.highcharts({
        chart: {type: 'pie', height: 300, margin: 0, marginTop: -110, spacingTop: 0},
        plotOptions: {
          pie: {
            allowPointSelect: true,
            dataLabels: {enabled: false},
            showInLegend: true
          }
        },
        tooltip: {
          valuePrefix: '$',
          valueSuffix: '/day',
          pointFormat: '<b>{point.y} ({point.percentage:.1f}%)</b><br/>'
        },
        title: {text: options.title || ''},
        series: [{name: 'Tags', data: series}]
      });
    },

    perCountryCPD: function ($el, data, options) {
      // List of country names used as x-axis
      var countryList = _.pluck(options.countryData, 'name');
      // Calculate the duration in each country based on the dates.
      // [{ name: 'country', dates: [{start: x, end: y}] }] => { country: 2 }
      var countryDuration = calculateTotalDuration(options.countryData);
      tripDate = getDateSpan(options.countryData);

      // List of tags used as y-axis
      var series = _.chain(data)
        // Each tag has its own entry
        .groupBy('tags')
        .map(function (tagData, tag) {
          // Create an array with an index for each country.
          var countryData = _.fill(Array(countryList.length), 0);
          var tagTotalAmount = 0;
          _.chain(tagData)
            .groupBy('country')
            .each(function (row, country) {
              var countryIndex = _.indexOf(countryList, country);
              var duration = countryDuration[country];
              // Only add the data if we can calculate the cost per day.
              if (duration) {
                var total = _.sum(row, 'amount');
                tagTotalAmount += total;
                countryData[countryIndex] = total / duration;
                countryData[countryIndex] = Math.round(countryData[countryIndex] * 100) / 100;
              }
            })
            .value();

          tagTotalData[tag] = tagTotalAmount;

          return {
            name: tag,
            visible: isVisibleByDefault(tag),
            data: countryData
          };
        })
        .value();

      $el.highcharts({
        chart: {
          type: 'bar',
          events: {
            redraw: function () {
              var axis = this.axes[1];
              axis.removePlotLine('plot-average');
              axis.addPlotLine(getAveragePlotLine(axis.series));
            }
          }
        },
        xAxis: {categories: countryList},
        yAxis: {
          min: 0, title: {text: 'Cost per day'}, labels: {format: '${value}'},
          stackLabels: {
            enabled: true,
            style: {color: '#999', fontWeight: 'normal', textShadow: 'none'}
          },
          plotLines: [getAveragePlotLine(series)]
        },
        legend: {reversed: true},
        plotOptions: {series: {stacking: 'normal'}},
        tooltip: {valuePrefix: '$'},
        title: {text: options.title || ''},
        series: series
      });
    }
  };

  function isVisibleByDefault(tag) {
    return tagsHidden.indexOf(tag) === -1;
  }

  function getAveragePlotLine(series) {
    var tripDuration = (tripDate.end - tripDate.start) / 1000 / 3600 / 24;
    var totalAmount = _.chain(series)
      .filter('visible')
      .reduce(function (total, series) {
        total += tagTotalData[series.name];
        return total;
      }, 0)
      .value();

    return {
      value: totalAmount / tripDuration,
      color: 'red',
      width: 2,
      zIndex: 20,
      id: 'plot-average'
    };
  }

  function calculateTotalDuration(data) {
    return _.chain(data)
      .indexBy('name')
      .mapValues(function (country) {
        return _.reduce(country.dates, function (total, date) {
          var start = new Date(date.start);
          var end = new Date(date.end);
          return total + (end - start) / 1000 / 3600 / 24;
        }, 0);
      })
      .value();
  }

  function getDateSpan(data) {
    var earliestDate = _.now();
    var latestDate = 0;

    _.chain(data)
      .pluck('dates')
      .flatten()
      .each(function (date) {
        var start = new Date(date.start);
        var end = new Date(date.end);
        if (start < earliestDate) {
          earliestDate = start;
        }
        if (end > latestDate) {
          latestDate = end;
        }
      })
      .value();

    return {
      start: earliestDate,
      end: latestDate
    };
  }

  function init(data) {
    $charts.each(function () {
      var $this = $(this);
      var chartType = $this.data('chart');
      var options = {
        trip: $this.data('trip'),
        country: $this.data('country'),
        title: $this.data('title'),
        countryData: []
      };
      var tripData = _.chain(data.expenditures)
        .filter('trip', options.trip)
        .each(function (expenditures) {
          options.countryData.push(expenditures.countries);
        })
        .pluck('data')
        .flatten()
        .value();

      // country dates should be merged really, but cant do it realiably as
      // some might have dates but not expenditure entries.
      options.countryData = _.chain(options.countryData)
        .flatten(options.countryData)
        .filter(function (country) {
          return country.dates.length > 0;
        })
        .value();

      if (options.country) {
        tripData = _.filter(tripData, 'country', options.country);
        options.countryData = _.filter(options.countryData, 'name', options.country);
      }

      if (!options.countryData.length) {
        $this.html('<p><em>No data available yet</em></p>');
        return;
      }

      chartTypes[chartType]($this, tripData, options);
    });
  }
}).call(this, this.jQuery, this._);

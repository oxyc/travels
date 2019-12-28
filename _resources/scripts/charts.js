import _ from 'lodash';
import tippy from 'tippy.js';
import { hideAll as tippyHideAll } from 'tippy.js';
import Highcharts from 'highcharts';

const charts = document.querySelectorAll('.expenditure-chart');
if (charts) {
  fetch('/expenditures.json')
    .then(data => data.json())
    .then(init);
}

let tooltipVisible = false;

const tagsHidden = ['flight', 'boat', 'tour'];

const templateExpenseTable = _.template(
  '<table>' +
  '<tr><th>Date</th><th>Amount</th><th>Description</th></tr>' +
  '<% _.forEach(data, function (row) { %>' +
  '<tr><td><%- row.date %><td>$<%- row.amount %></td><td><%- row.description || "" %></td></tr>' +
  '<% }); %>' +
  '</table>'
);

let tripDate;
const tagTotalData = {};

const chartTypes = {
  perTagCPD: (el, data, options) => {
    let duration = calculateTotalDuration(options.countryData);
    duration = duration[options.country];

    const series = _.chain(data)
      .groupBy('tags')
      .map((tagData, tag) => {
        let amount = _.sumBy(row, (transaction) => parseInt(transaction.amount));
        amount = Math.round(amount / duration * 100) / 100;
        return {name: tag, y: amount};
      })
      .value();

    Highcharts.chart(el, {
      chart: {type: 'pie'},
      plotOptions: {
        pie: {
          allowPointSelect: true,
          dataLabels: {enabled: false},
          showInLegend: true,
          events: {
            click: (event) => {
              const tag = event.point.name;
              const expenses = _.filter(data, (expense) => expense.tags === tag);
              showExpenseTable(event.target, expenses);
            }
          }
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

  perCountryCPD: (el, data, options) => {
    // List of country names used as x-axis
    const countryList = _.map(options.countryData, 'name');
    // Calculate the duration in each country based on the dates.
    // [{ name: 'country', dates: [{start: x, end: y}] }] => { country: 2 }
    const countryDuration = calculateTotalDuration(options.countryData);
    tripDate = getDateSpan(options.countryData);

    // List of tags used as y-axis
    const series = _.chain(data)
      // Each tag has its own entry
      .groupBy('tags')
      .map((tagData, tag) => {
        // Create an array with an index for each country.
        const countryData = _.fill(Array(countryList.length), 0);
        let tagTotalAmount = 0;
        _.chain(tagData)
          .groupBy('country')
          .each((row, country) => {
            const countryIndex = _.indexOf(countryList, country);
            const duration = countryDuration[country];
            // Only add the data if we can calculate the cost per day.
            if (duration) {
              const total = _.sumBy(row, (transaction) => parseInt(transaction.amount));
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

    Highcharts.chart(el, {
      chart: {
        type: 'bar',
        events: {
          redraw: () => {
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
      plotOptions: {
        series: {stacking: 'normal'},
        bar: {
          events: {
            click(event) {
              const country = event.point.category;
              const tag = this.name;
              const expenses = _.filter(data, (expense) => {
                return (expense.country === country && expense.tags === tag);
              });
              showExpenseTable(event.target, expenses);
            }
          }
        }
      },
      tooltip: {valuePrefix: '$'},
      title: {text: options.title || ''},
      series: series
    });
  }
};

function showExpenseTable(element, expenses) {
  // Make this element distinquishable in the auto-close listener.
  element.tooltipInitalizer = true;
  tippyHideAll({exclude: element});
  // @todo
  const tooltip = element._tippy || tippy(element, {
    content: templateExpenseTable({data: expenses}),
    trigger: 'click',
  });
  tooltip.show();
  tooltipVisible = true;
}

function isVisibleByDefault(tag) {
  return tagsHidden.indexOf(tag) === -1;
}

function getAveragePlotLine(series) {
  const tripDuration = (tripDate.end - tripDate.start) / 1000 / 3600 / 24 + 1;
  const totalAmount = _.chain(series)
    .filter('visible')
    .reduce((total, series) => total + tagTotalData[series.name], 0)
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
    .keyBy('name')
    .mapValues(function (country) {
      return _.reduce(country.dates, (total, date) => {
        const start = new Date(date.start);
        const end = new Date(date.end);
        return total + (end - start) / 1000 / 3600 / 24 + 1;
      }, 0);
    })
    .value();
}

function getDateSpan(data) {
  let earliestDate = _.now();
  let latestDate = 0;

  _.chain(data)
    .map('dates')
    .flatten()
    .each((date) => {
      const start = new Date(date.start);
      const end = new Date(date.end);
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
  for (let i = 0; i < charts.length; i++) {
    const el = charts[i];
    const chartType = el.dataset.chart;
    const options = {
      trip: el.dataset.trip,
      country: el.dataset.country,
      title: el.dataset.title,
      countryData: []
    };
    const tripData = _.chain(data.expenditures)
      .filter('trip', options.trip)
      .each((expenditures) => options.countryData.push(expenditures.countries))
      .map('data')
      .flatten()
      .value();

    // country dates should be merged really, but cant do it realiably as
    // some might have dates but not expenditure entries.
    options.countryData = _.chain(options.countryData)
      .flatten(options.countryData)
      .filter((country) => country.dates.length > 0)
      .value();

    if (options.country) {
      tripData = _.filter(tripData, 'country', options.country);
      options.countryData = _.filter(options.countryData, 'name', options.country);
    }

    if (!options.countryData.length) {
      el.innerHTML = '<p><em>No data available yet</em></p>';
      return;
    }

    chartTypes[chartType](el, tripData, options);
  }

  document.addEventListener('click', (event) => {
    if (!tooltipVisible || (event.target && event.target.tooltipInitalizer)) {
      return;
    }
    tippyHideAll();
    tooltipVisible = false;
  });
}

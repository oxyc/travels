(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/scripts/app"],{

/***/ "./_resources/scripts/app.js":
/*!***********************************!*\
  !*** ./_resources/scripts/app.js ***!
  \***********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map.js */ "./_resources/scripts/map.js");
/* harmony import */ var _charts_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./charts.js */ "./_resources/scripts/charts.js");
/* harmony import */ var _commits_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./commits.js */ "./_resources/scripts/commits.js");




/***/ }),

/***/ "./_resources/scripts/charts.js":
/*!**************************************!*\
  !*** ./_resources/scripts/charts.js ***!
  \**************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var tippy_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! tippy.js */ "./node_modules/tippy.js/dist/tippy.esm.js");
/* harmony import */ var highcharts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! highcharts */ "./node_modules/highcharts/highcharts.js");
/* harmony import */ var highcharts__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(highcharts__WEBPACK_IMPORTED_MODULE_3__);
var _this = undefined;

function _readOnlyError(name) { throw new Error("\"" + name + "\" is read-only"); }






var $charts = jquery__WEBPACK_IMPORTED_MODULE_0___default()('.expenditure-chart');

if ($charts.length) {
  jquery__WEBPACK_IMPORTED_MODULE_0___default.a.getJSON('/expenditures.json', init);
}

var tooltipVisible = false;
var tagsHidden = ['flight', 'boat', 'tour'];

var templateExpenseTable = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.template('<table>' + '<tr><th>Date</th><th>Amount</th><th>Description</th></tr>' + '<% _.forEach(data, function (row) { %>' + '<tr><td><%- row.date %><td>$<%- row.amount %></td><td><%- row.description || "" %></td></tr>' + '<% }); %>' + '</table>');

var tripDate;
var tagTotalData = {};
var chartTypes = {
  perTagCPD: function perTagCPD(el, data, options) {
    var duration = calculateTotalDuration(options.countryData);
    duration = duration[options.country];

    var series = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(data).groupBy('tags').map(function (tagData, tag) {
      var amount = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sumBy(row, function (transaction) {
        return parseInt(transaction.amount);
      });

      amount = Math.round(amount / duration * 100) / 100;
      return {
        name: tag,
        y: amount
      };
    }).value();

    highcharts__WEBPACK_IMPORTED_MODULE_3___default.a.chart(el, {
      chart: {
        type: 'pie'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          dataLabels: {
            enabled: false
          },
          showInLegend: true,
          events: {
            click: function click(event) {
              var tag = event.point.name;

              var expenses = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(data, function (expense) {
                return expense.tags === tag;
              });

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
      title: {
        text: options.title || ''
      },
      series: [{
        name: 'Tags',
        data: series
      }]
    });
  },
  perCountryCPD: function perCountryCPD(el, data, options) {
    // List of country names used as x-axis
    var countryList = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(options.countryData, 'name'); // Calculate the duration in each country based on the dates.
    // [{ name: 'country', dates: [{start: x, end: y}] }] => { country: 2 }


    var countryDuration = calculateTotalDuration(options.countryData);
    tripDate = getDateSpan(options.countryData); // List of tags used as y-axis

    var series = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(data) // Each tag has its own entry
    .groupBy('tags').map(function (tagData, tag) {
      // Create an array with an index for each country.
      var countryData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.fill(Array(countryList.length), 0);

      var tagTotalAmount = 0;

      lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(tagData).groupBy('country').each(function (row, country) {
        var countryIndex = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.indexOf(countryList, country);

        var duration = countryDuration[country]; // Only add the data if we can calculate the cost per day.

        if (duration) {
          var total = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.sumBy(row, function (transaction) {
            return parseInt(transaction.amount);
          });

          tagTotalAmount += total;
          countryData[countryIndex] = total / duration;
          countryData[countryIndex] = Math.round(countryData[countryIndex] * 100) / 100;
        }
      }).value();

      tagTotalData[tag] = tagTotalAmount;
      return {
        name: tag,
        visible: isVisibleByDefault(tag),
        data: countryData
      };
    }).value();

    highcharts__WEBPACK_IMPORTED_MODULE_3___default.a.chart(el, {
      chart: {
        type: 'bar',
        events: {
          redraw: function redraw() {
            var axis = _this.axes[1];
            axis.removePlotLine('plot-average');
            axis.addPlotLine(getAveragePlotLine(axis.series));
          }
        }
      },
      xAxis: {
        categories: countryList
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Cost per day'
        },
        labels: {
          format: '${value}'
        },
        stackLabels: {
          enabled: true,
          style: {
            color: '#999',
            fontWeight: 'normal',
            textShadow: 'none'
          }
        },
        plotLines: [getAveragePlotLine(series)]
      },
      legend: {
        reversed: true
      },
      plotOptions: {
        series: {
          stacking: 'normal'
        },
        bar: {
          events: {
            click: function click(event) {
              var country = event.point.category;
              var tag = this.name;

              var expenses = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(data, function (expense) {
                return expense.country === country && expense.tags === tag;
              });

              showExpenseTable(event.target, expenses);
            }
          }
        }
      },
      tooltip: {
        valuePrefix: '$'
      },
      title: {
        text: options.title || ''
      },
      series: series
    });
  }
};

function showExpenseTable(element, expenses) {
  // Make this element distinquishable in the auto-close listener.
  element.tooltipInitalizer = true;
  Object(tippy_js__WEBPACK_IMPORTED_MODULE_2__["hideAll"])({
    exclude: element
  }); // @todo

  var tooltip = element._tippy || Object(tippy_js__WEBPACK_IMPORTED_MODULE_2__["default"])(element, {
    content: templateExpenseTable({
      data: expenses
    }),
    trigger: 'click'
  });
  tooltip.show();
  tooltipVisible = true;
}

function isVisibleByDefault(tag) {
  return tagsHidden.indexOf(tag) === -1;
}

function getAveragePlotLine(series) {
  var tripDuration = (tripDate.end - tripDate.start) / 1000 / 3600 / 24 + 1;

  var totalAmount = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(series).filter('visible').reduce(function (total, series) {
    return total + tagTotalData[series.name];
  }, 0).value();

  return {
    value: totalAmount / tripDuration,
    color: 'red',
    width: 2,
    zIndex: 20,
    id: 'plot-average'
  };
}

function calculateTotalDuration(data) {
  return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(data).keyBy('name').mapValues(function (country) {
    return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.reduce(country.dates, function (total, date) {
      var start = new Date(date.start);
      var end = new Date(date.end);
      return total + (end - start) / 1000 / 3600 / 24 + 1;
    }, 0);
  }).value();
}

function getDateSpan(data) {
  var earliestDate = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.now();

  var latestDate = 0;

  lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(data).map('dates').flatten().each(function (date) {
    var start = new Date(date.start);
    var end = new Date(date.end);

    if (start < earliestDate) {
      earliestDate = start;
    }

    if (end > latestDate) {
      latestDate = end;
    }
  }).value();

  return {
    start: earliestDate,
    end: latestDate
  };
}

function init(data) {
  $charts.each(function (idx, el) {
    var $this = jquery__WEBPACK_IMPORTED_MODULE_0___default()(el);
    var chartType = $this.data('chart');
    var options = {
      trip: $this.data('trip'),
      country: $this.data('country'),
      title: $this.data('title'),
      countryData: []
    };

    var tripData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(data.expenditures).filter('trip', options.trip).each(function (expenditures) {
      return options.countryData.push(expenditures.countries);
    }).map('data').flatten().value(); // country dates should be merged really, but cant do it realiably as
    // some might have dates but not expenditure entries.


    options.countryData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(options.countryData).flatten(options.countryData).filter(function (country) {
      return country.dates.length > 0;
    }).value();

    if (options.country) {
      tripData = (_readOnlyError("tripData"), lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(tripData, 'country', options.country));
      options.countryData = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.filter(options.countryData, 'name', options.country);
    }

    if (!options.countryData.length) {
      $this.html('<p><em>No data available yet</em></p>');
      return;
    }

    chartTypes[chartType](el, tripData, options);
  });
  jquery__WEBPACK_IMPORTED_MODULE_0___default()(document).on('click', function (event) {
    if (!tooltipVisible || event.target && event.target.tooltipInitalizer) {
      return;
    }

    Object(tippy_js__WEBPACK_IMPORTED_MODULE_2__["hideAll"])();
    tooltipVisible = false;
  });
}

/***/ }),

/***/ "./_resources/scripts/commits.js":
/*!***************************************!*\
  !*** ./_resources/scripts/commits.js ***!
  \***************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);

var $el = jquery__WEBPACK_IMPORTED_MODULE_0___default()('#commit-history');

if ($el.length) {
  var path = 'https://api.github.com/repos/oxyc/travels/commits';

  var template = _.template('<li><a href="<%- html_url %>"><span class="date"><%- new Date(commit.author.date).toDateString() %></span> <%- commit.message %></li>');

  jquery__WEBPACK_IMPORTED_MODULE_0___default.a.getJSON(path).done(function (data) {
    var content = _.reduce(data, function (content, commit) {
      return content + template(commit);
    }, '');

    $el.html(content);
  });
}

/***/ }),

/***/ "./_resources/scripts/map.js":
/*!***********************************!*\
  !*** ./_resources/scripts/map.js ***!
  \***********************************/
/*! exports provided: lMap, cluster, controls, markers, routeStyles, openPopup */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lMap", function() { return lMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cluster", function() { return cluster; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "controls", function() { return controls; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "markers", function() { return markers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "routeStyles", function() { return routeStyles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openPopup", function() { return openPopup; });
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash */ "./node_modules/lodash/lodash.js");
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! leaflet */ "./node_modules/leaflet/dist/leaflet-src.js");
/* harmony import */ var leaflet__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(leaflet__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _mapbox_leaflet_omnivore__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @mapbox/leaflet-omnivore */ "./node_modules/@mapbox/leaflet-omnivore/index.js");
/* harmony import */ var _mapbox_leaflet_omnivore__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_mapbox_leaflet_omnivore__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var leaflet_markercluster__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! leaflet.markercluster */ "./node_modules/leaflet.markercluster/dist/leaflet.markercluster-src.js");
/* harmony import */ var leaflet_markercluster__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(leaflet_markercluster__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var leaflet_makimarkers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! leaflet-makimarkers */ "./node_modules/leaflet-makimarkers/Leaflet.MakiMarkers.js");
/* harmony import */ var leaflet_makimarkers__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(leaflet_makimarkers__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var leaflet_search__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! leaflet-search */ "./node_modules/leaflet-search/dist/leaflet-search.src.js");
/* harmony import */ var leaflet_search__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(leaflet_search__WEBPACK_IMPORTED_MODULE_6__);







leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Icon.Default.imagePath = '/dist/images';
leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.mapbox = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.mapbox || {};
leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.mapbox.accessToken = 'pk.eyJ1Ijoib3h5IiwiYSI6InBMaXRxSDAifQ.w9NqRLivEBn6BoMRkKmg3A';
leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.MakiMarkers.accessToken = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.mapbox.accessToken; // Short timeout as some geojson files might not exist yet.

var AJAX_TIMEOUT = 5000;
var lMap = createMap('world-map');
var cluster = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.markerClusterGroup({
  maxClusterRadius: 20
}).addTo(lMap);
var controls = {};
var markers = {
  trek: {
    icon: 'campsite',
    color: '#159957'
  },
  city: {
    icon: 'circle',
    color: '#659CD6'
  },
  park: {
    icon: 'park',
    color: '#159957'
  },
  homebase: {
    icon: 'building',
    color: '#D85E5E'
  },
  photo: {
    icon: 'camera',
    color: '#659CD6',
    size: 's'
  },
  visited: {
    color: '#659CD6'
  }
};
var routeStyles = {
  trek: {
    color: '#159957',
    opacity: 1,
    weight: 5
  },
  route: {
    color: '#000',
    opacity: 1,
    weight: 2
  },
  tour: {
    color: '#000',
    opacity: 1,
    weight: 2
  },
  flight: {
    color: '#000',
    opacity: 0.3,
    weight: 2
  },
  boat: {
    color: '#2057D0',
    opacity: 0.3,
    weight: 2
  },
  mouseover: {
    color: '#ff0000',
    opacity: 0.7,
    weight: 3
  }
};
var $map = jquery__WEBPACK_IMPORTED_MODULE_0___default()('#world-map');

var preSelectedTrips = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.reject($map.data('trips').split(' ') || [], lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty);

var preSelectedCountries = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.reject($map.data('country').split(' ') || [], lodash__WEBPACK_IMPORTED_MODULE_1___default.a.isEmpty);

var leafletMeta = {}; // Initialize

jquery__WEBPACK_IMPORTED_MODULE_0___default.a.getJSON('/world.json').done(init);

var templateMarkerPopup = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.template('<strong><%- name %>, <%- _.startCase(country) %></strong> <small><%- type %></small><br>' + '<% if (!visited) { %><em>planning to visit</em><br><% } %>' + '<% if (typeof homebase !== "undefined" && homebase) { %><em>I used to live here</em><% } %>' + '<% if (typeof description !== "undefined") { %><span class="description"><%- description %></span><% } %>');

var templateRoutePopup = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.template('<strong><%- name %></strong> <small><%- type %></small><br>' + 'Distance: <%- Math.round(distance / 1000) %> km');

function openPopup(layer) {
  // Exit if the layer isnt visible
  if (!cluster.hasLayer(layer) || !layer._icon && !layer.__parent._icon) {
    return false;
  }

  cluster.zoomToShowLayer(layer, function () {
    if (layer._popup) {
      layer.openPopup();
    }
  });
}
;

function pairs(array) {
  return array.slice(1).map(function (b, i) {
    return [array[i], b];
  });
}

function bindMarkerPopup(feature, layer) {
  var content = templateMarkerPopup(feature.properties);
  layer.bindPopup(content);
}

function bindRoutePopup(feature, layer) {
  feature.properties.distance = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.reduce(pairs(feature.geometry.coordinates), function (total, pair) {
    return total + leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.latLng(pair[0][1], pair[0][0]).distanceTo(leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.latLng(pair[1][1], pair[1][0]));
  }, 0);
  var content = templateRoutePopup(feature.properties);
  layer.bindPopup(content);
}

function getMarkerIcon(feature, latlng) {
  var key = feature.properties.type.toLowerCase();

  if (feature.properties.homebase) {
    key = 'homebase';
  } else if (['national park', 'nature reserve'].indexOf(key) !== -1) {
    key = 'park';
  } else if (!markers.hasOwnProperty(key)) {
    key = 'visited';
  }

  var marker = markers[key];

  if (!feature.properties.visited) {
    marker = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.clone(marker);
    marker.color = '#999';
  }

  return leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.marker(latlng, {
    icon: leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.MakiMarkers.icon(marker)
  });
}

function getRouteStyle(feature) {
  return routeStyles[feature.properties.type.toLowerCase()];
}

function createMap(selector) {
  var map = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.map(selector, {
    center: [18, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    scrollWheelZoom: false
  });
  leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}' + (leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Browser.retina ? '@2x' : '') + '.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'oxy.ndp8318l',
    accessToken: leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.mapbox.accessToken
  }).addTo(map);
  return map;
}

function prepareLayers(type, data, groupOptions) {
  var collection = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(data) // If it's TopoJson require that there be arcs.
  .filter(function (featureGroup) {
    return featureGroup.features.type !== 'Topology' || featureGroup.features.arcs.length;
  }).forEach(function (featureGroup) {
    if (featureGroup.features.type === 'Topology') {
      var layer = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.geoJson(null, groupOptions);
      featureGroup.layer = _mapbox_leaflet_omnivore__WEBPACK_IMPORTED_MODULE_3__["topojson"].parse(featureGroup.features, null, layer);
    } else {
      featureGroup.layer = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.geoJson(featureGroup.features, groupOptions);
    }

    featureGroup.layer.type = type;
    featureGroup.layer.id = featureGroup.properties.id;
  }).keyBy(function (featureGroup) {
    return featureGroup.properties.name;
  }).value();

  return lodash__WEBPACK_IMPORTED_MODULE_1___default.a.mapValues(collection, 'layer');
}

function createControl(type, layers) {
  var control = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.control.layers(null, layers, {
    collapsed: true
  }).addTo(lMap); // Add custom classes to the leaflet control

  var container = control.getContainer();
  leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.DomUtil.addClass(container, 'control-custom');
  leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.DomUtil.addClass(container, 'control-' + type);

  if (!leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Browser.touch) {
    leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.DomEvent.disableClickPropagation(container).disableScrollPropagation(container);
  } else {
    leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.DomEvent.disableClickPropagation(container);
  }

  return control;
}

function toggleControlCheckboxes(control, labels, onState) {
  // List of the layer ids corresponding the the listed labels (strings).
  var layerIds = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(control._layers).pick(function (layer) {
    return labels.indexOf(layer.layer.id) !== -1;
  }).keys().value(); // Iterate over all the checkboxes in the controls form,


  var inputs = control._form.getElementsByTagName('input');

  for (var i = 0, l = inputs.length; i < l; i++) {
    var input = inputs[i]; // Skip checkboxes for countries not part of this trip.

    if (layerIds.indexOf(String(input.layerId)) === -1) {
      continue;
    } // The checkbox is already checked.


    if (onState && input.checked) {
      continue;
    } // The checkbox is already unchecked.


    if (!onState && !input.checked) {
      continue;
    } // Trigger a click so that Leaflet acts on it and triggers this
    // same event but for each country.


    jquery__WEBPACK_IMPORTED_MODULE_0___default()(input).trigger('click');
  }
}

function setTripLayerStyles(feature, layer) {
  var defaultStyle = getRouteStyle(feature);
  bindRoutePopup(feature, layer);
  layer.setStyle(defaultStyle);

  (function () {
    // @todo
    layer.on('mouseover', function () {
      return layer.setStyle(routeStyles.mouseover);
    });
    layer.on('mouseout', function () {
      return layer.setStyle(defaultStyle);
    });
  })();
}

function createSearchControl() {
  var control = new leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Control.Search({
    layer: cluster,
    propertyName: 'name',
    circleLocation: false,
    initial: false,
    autoCollapse: true,
    zoom: 10
  });
  control.on('search_locationfound', function (e) {
    return openPopup(e.layer);
  });
  return control;
}

function createCountryLayers(countryCollection) {
  countryCollection = countryCollection.sort(function (a, b) {
    if (a.properties.id < b.properties.id) {
      return -1;
    }

    if (a.properties.id > b.properties.id) {
      return 1;
    }

    return 0;
  }); // The real layers

  var countryLayers = prepareLayers('country', countryCollection, {
    onEachFeature: bindMarkerPopup,
    pointToLayer: getMarkerIcon
  }); // @see https://github.com/Leaflet/Leaflet.markercluster/issues/13
  // Create dummy layers without markers. When these are clicked, the
  // corresponding real layer will be added/removed to the
  // MarkerClusterGroup.

  var dummyLayers = {};

  lodash__WEBPACK_IMPORTED_MODULE_1___default.a.forEach(countryLayers, function (layer, name) {
    dummyLayers[name] = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.layerGroup();
    dummyLayers[name].type = 'country';
    dummyLayers[name].id = layer.id; // If a pre-selected country is defiend, exit here so that it's not
    // preselected.

    if (preSelectedCountries.length && preSelectedCountries.indexOf(layer.id) === -1) {
      return;
    } // Dummy layer is attached to Map


    dummyLayers[name].addTo(lMap); // Real layer is attached to MarkerClusterGroup

    cluster.addLayer(layer);
  }); // Controls point the the dummy layers.


  var countryControl = controls.country = createControl('country', dummyLayers); // Add a mapping so that we can find the real layer alter.

  for (var row in countryControl._layers) {
    if (countryControl._layers.hasOwnProperty(row)) {
      leafletMeta[leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Util.stamp(countryControl._layers[row].layer)] = countryControl._layers[row].name;
    }
  }

  lMap.on('overlayadd overlayremove', function (overlay) {
    var index = leafletMeta[leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Util.stamp(overlay.layer)];

    if (overlay.layer.type !== 'country') {
      return;
    }

    if (overlay.type === 'overlayadd') {
      cluster.addLayer(countryLayers[index]);
    } else {
      cluster.removeLayer(countryLayers[index]);
    }
  });
  return countryLayers;
}

function createTripLayers(tripCollection) {
  var tripLayers = prepareLayers('trip', tripCollection, {
    onEachFeature: setTripLayerStyles
  });

  if (!preSelectedCountries.length) {
    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.forEach(tripLayers, function (layer) {
      return layer.addTo(lMap);
    });
  }

  var tripControl = controls.trip = createControl('trip', tripLayers);

  for (var row in tripControl._layers) {
    if (tripControl._layers.hasOwnProperty(row)) {
      leafletMeta[leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Util.stamp(tripControl._layers[row].layer)] = tripControl._layers[row].name;
    }
  }

  lMap.on('overlayadd overlayremove', function (overlay) {
    var index = leafletMeta[leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.Util.stamp(overlay.layer)];

    if (overlay.layer.type !== 'trip') {
      return;
    }

    var trip = tripCollection[index];

    var countries = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(trip.properties.countries, 'name');

    var control = controls.country;
    var on = overlay.type === 'overlayadd';
    toggleControlCheckboxes(control, countries, on);
  });

  if (preSelectedTrips.length) {
    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(tripLayers).pick(function (layer) {
      return preSelectedTrips.indexOf(layer.id) === -1;
    }).forEach(function (layer) {
      return lMap.removeLayer(layer);
    }).value();

    lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(tripLayers).pick(function (layer) {
      return preSelectedTrips.indexOf(layer.id) !== -1;
    }).forEach(function (layer) {
      lMap.removeLayer(layer);
      lMap.addLayer(layer);
    }).value();
  }
}

function init(data) {
  // Issue XHR requests for the routes of all trips, but do it async while
  // rendering regular markers.
  var tripCollection = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.forEach(data.trips, function (trip) {
    trip.promise = jquery__WEBPACK_IMPORTED_MODULE_0___default.a.ajax({
      dataType: 'json',
      url: '/' + trip.path,
      timeout: AJAX_TIMEOUT
    });
  }); // Remove the placeholder image as it gets displayed while tiles are
  // fetched.


  lMap.once('zoomstart', function () {
    return $map.css('background-image', 'none');
  });
  lMap.on('overlayadd overlayremove', lodash__WEBPACK_IMPORTED_MODULE_1___default.a.debounce(function (event) {
    if (event.layer.type && event.layer.type === 'country') {
      var layers = cluster.getLayers();

      if (!layers.length) {
        return;
      }

      var bounds = new leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.LatLngBounds();

      for (var i = 0, l = layers.length; i < l; i++) {
        bounds.extend(layers[i].getLatLng());
      }

      lMap.fitBounds(bounds);
    }
  }, 100)); // Create the country layers.

  createCountryLayers(data.countries);
  lMap.addControl(createSearchControl()); // Wait for all requests to finish

  Promise.allSettled(lodash__WEBPACK_IMPORTED_MODULE_1___default.a.map(tripCollection, 'promise')).then(function () {
    tripCollection = lodash__WEBPACK_IMPORTED_MODULE_1___default.a.chain(tripCollection) // Filter out failed requests.
    .pick(function (trip) {
      return trip.promise.statusCode().status === 200;
    }) // Attach the features collected from the XHR request.
    .forEach(function (trip) {
      return trip.features = trip.promise.responseJSON;
    }).keyBy(function (trip) {
      return trip.properties.name;
    }).value(); // Create the trip layers.

    createTripLayers(tripCollection);

    if (!controls.other) {
      controls.other = leaflet__WEBPACK_IMPORTED_MODULE_2___default.a.control.layers(null, null, {
        collapsed: false
      }).addTo(lMap);
      controls.other.addOverlay(cluster, 'Markers');
    }
  });
}

/***/ }),

/***/ "./_resources/styles/abovefold.scss":
/*!******************************************!*\
  !*** ./_resources/styles/abovefold.scss ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ "./_resources/styles/app.scss":
/*!************************************!*\
  !*** ./_resources/styles/app.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),

/***/ 0:
/*!*********************************************************************************************************!*\
  !*** multi ./_resources/scripts/app.js ./_resources/styles/app.scss ./_resources/styles/abovefold.scss ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! /Users/oskarscholdstrom/Projects/Personal/travels/_resources/scripts/app.js */"./_resources/scripts/app.js");
__webpack_require__(/*! /Users/oskarscholdstrom/Projects/Personal/travels/_resources/styles/app.scss */"./_resources/styles/app.scss");
module.exports = __webpack_require__(/*! /Users/oskarscholdstrom/Projects/Personal/travels/_resources/styles/abovefold.scss */"./_resources/styles/abovefold.scss");


/***/ }),

/***/ 1:
/*!************************!*\
  !*** xmldom (ignored) ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

},[[0,"/scripts/manifest","/scripts/vendor"]]]);
//# sourceMappingURL=app.js.map
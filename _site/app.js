(function ($, _, L) {
  'use strict';

  $.getJSON('/trips.json').done(init);

  var templateLayerName = _.template('<%- name %> (<%- date.start %> - <% if (date.end) { data.end } else { %>now<% } %>)');
  var templatePopup = _.template(
    '<strong><%- name %></strong> <small><%- type %></small><br>' +
    '<em><% if (visited) { %>visited<% } else { %>planning to visit<% } %></em>'
  );

  function bindPopup(feature, layer) {
    var content = templatePopup(feature.properties);
    layer.bindPopup(content);
  }

  function createLayers(trips) {
    var layers = {};
    // Iterate over each trip.
    _.chain(trips)
      // Filter out trips and destinations without feature data.
      .filter(function (trip) {
        trip.destinations = _.filter(trip.destinations, function (destination) {
          return !_.isEmpty(destination.features);
        });
        return !_.isEmpty(trip.destinations);
      })
      // Populate the layer object as { "<trip name>": <LayerGroup> }
      .each(function (trip) {
        var name = templateLayerName(trip);
        layers[name] = L.geoJson(_.chain(trip.destinations)
          .pluck('features')
          .flatten()
          .value(), {onEachFeature: bindPopup});
      })
      .value();

    return layers;
  }

  function createMap(selector, layers) {
    var map = L.map(selector, {
      center: [18, 0],
      zoom: 2,
      layers: layers
    });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'oxy.ndp8318l',
      accessToken: 'pk.eyJ1Ijoib3h5IiwiYSI6InBMaXRxSDAifQ.w9NqRLivEBn6BoMRkKmg3A'
    }).addTo(map);

    return map;
  }

  function init(data) {
    var destinations = _.filter(data.destinations, function (destination) {
      return Boolean(destination.path);
    });
    var promises = _.map(destinations, function (destination) {
      return $.getJSON('/' + destination.path);
    });
    var trips = data.trips;
    var map;
    var layers;

    $.when.apply(null, promises).done(function () {
      // Attach features to each matching destination on every trip.
      _.each(_.toArray(arguments), function (data, idx) {
        var name = destinations[idx].name;
        var features = _.first(data).features;
        _.map(trips, function (trip) {
          var destinationIdx = _.findIndex(trip.destinations, 'name', name);
          trip.destinations[destinationIdx].features = features;
          return trip;
        });
      });

      layers = createLayers(trips);
      map = createMap('world-map', _.values(layers));
      L.control.layers(null, layers, {collapsed: false}).addTo(map);
    });
  }
})(jQuery, this._, this.L);

(function ($, _, L) {
  'use strict';

  // Short timeout as some geojson files might not exist yet.
  var AJAX_TIMEOUT = 1000;

  var $map = $('#world-map');
  var preSelectedTrips = $map.data('trips').split(' ') || [];
  var preSelectedCountries = $map.data('country').split(' ') || [];

  $.getJSON('/trips.json').done(init);

  var templateLayerName = _.template(
    '<%- name %>' +
    '<% if (typeof date !== "undefined") { %>' +
    ' (<%- date.start %> - <% if (date.end) { %><%- date.end %><% } else { %>now<% } %>)' +
    '<% } %>'
  );
  var templatePopup = _.template(
    '<strong><%- name %></strong> <small><%- type %></small><br>' +
    '<em><% if (visited) { %>visited<% } else { %>planning to visit<% } %></em>'
  );

  var markers = {
    trek: {icon: 'campsite', color: '#159957'},
    city: {icon: 'circle', color: '#659CD6'},
    park: {icon: 'park', color: '#159957'},
    homebase: {icon: 'building', color: '#D85E5E'},
    visited: {color: '#659CD6'}
  };

  function bindPopup(feature, layer) {
    var content = templatePopup(feature.properties);
    layer.bindPopup(content);
  }
  function setMarker(feature, latlng) {
    var marker;
    switch (feature.properties.type) {
      case 'Trek':
        marker = markers.trek;
        break;
      case 'City':
        marker = markers.city;
        if (feature.properties.homebase) {
          marker = markers.homebase;
        }
        break;
      case 'National Park':
        marker = markers.park;
        break;
      default:
        marker = markers.visited;
        break;
    }
    if (!feature.properties.visited) {
      marker = _.clone(marker);
      marker.color = '#999';
    }
    return L.marker(latlng, {icon: L.MakiMarkers.icon(marker)});
  }

  function fitBounds(map) {
    var points = [];
    map.eachLayer(function (layer) {
      if (typeof layer.getLatLng === 'function') {
        points.push(layer.getLatLng());
      }
    });

    if (points.length === 1) {
      map.panTo(points[0]);
      map.setZoom(10);
    } else if (points.length >= 2) {
      var bounds = L.latLngBounds(points.shift(), points.shift());
      _.forEach(points, function (point) {
        bounds.extend(point);
      });
      map.fitBounds(bounds, {padding: [50, 50]});
    }
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

    map.on('overlayadd overlayremove', fitBounds.bind(null, map));
    fitBounds(map);

    return map;
  }

  function init(data) {
    // Issue XHR requests for all trips available.
    var trips = _.map(data.trips, function (trip) {
      trip.promise = $.ajax({
        dataType: 'json',
        url: '/' + trip.geojson,
        timeout: AJAX_TIMEOUT
      });
      return trip;
    });

    // Issue XHR requests for all countries pre-selected.
    var countries = _.chain(preSelectedCountries)
      // Populate a structure similar to that of trips so that they can
      // reuse the same logic
      .map(function (countryId) {
        var country = {};
        country.id = countryId;
        country.name = _.chain(data.destinations)
          .find({id: countryId})
          .get('name')
          .value();

        country.promise = $.ajax({
          dataType: 'json',
          url: '/destinations/' + country.id + '.geojson',
          timeout: AJAX_TIMEOUT
        });
        return country;
      })
      .value();

    var promises = _.union(
      _.pluck(trips, 'promise'),
      _.pluck(countries, 'promise')
    );

    // Wait for all requests to finish
    $.whenAll.apply(null, promises).always(function () {
      // Build the complete layer structure including Leaflet layers.
      var layerData = _.chain(_.union(trips, countries))
        // Remove trips which dont have geojson files yet.
        .filter(function (layer) {
          switch (layer.promise.statusCode().status) {
            case 200:
            case 304:
              return true;
            default:
              return false;
          }
        })
        // Attach Leaflet LayerGroups
        .map(function (layer) {
          layer.features = layer.promise.responseJSON.features;
          layer.layer = L.geoJson(layer.features, {onEachFeature: bindPopup, pointToLayer: setMarker});
          return layer;
        })
        // Strucutre according to how labeled LayerGroups need to be added.
        .indexBy(function (layer) {
          return templateLayerName(layer);
        })
        .value();

      // Create the structure which will be passed to Leaflet for building
      // overlays.
      var layers = _.mapValues(layerData, function (layer) {
        return layer.layer;
      });

      // Figure out which layers shoud be pre-selected on initialization.
      var preSelectedLayers = _.chain(layerData)
        .filter(function (layer) {
          return preSelectedTrips.indexOf(layer.id) !== -1 ||
            preSelectedCountries.indexOf(layer.id) !== -1;
        })
        .map(function (layer) {
          return layer.layer;
        })
        .value();

      // Create the map
      var map = createMap('world-map', preSelectedLayers);
      // Add the overlays.
      L.control.layers(null, layers, {collapsed: false}).addTo(map);
    });
  }
})(jQuery, this._, this.L);

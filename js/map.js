(function ($, _, L, omnivore) {
  'use strict';

  L.Icon.Default.imagePath = '/dist/images';

  var isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 50rem)').matches;

  // Short timeout as some geojson files might not exist yet.
  var AJAX_TIMEOUT = 5000;

  var exports = {};

  exports.lMap = createMap('world-map');
  exports.cluster = L.markerClusterGroup({maxClusterRadius: 20}).addTo(exports.lMap);

  exports.$map = $('#world-map');
  exports.controls = {};

  exports.markers = {
    trek: {icon: 'campsite', color: '#159957'},
    city: {icon: 'circle', color: '#659CD6'},
    park: {icon: 'park', color: '#159957'},
    homebase: {icon: 'building', color: '#D85E5E'},
    photo: {icon: 'camera', color: '#659CD6', size: 's'},
    visited: {color: '#659CD6'}
  };

  exports.routeStyles = {
    trek: {color: '#159957', opacity: 1, weight: 5},
    route: {color: '#000', opacity: 1, weight: 2},
    tour: {color: '#000', opacity: 1, weight: 2},
    flight: {color: '#000', opacity: 0.3, weight: 2},
    boat: {color: '#2057D0', opacity: 0.3, weight: 2},
    mouseover: {color: '#ff0000', opacity: 0.7, weight: 3}
  };

  var preSelectedTrips = exports.$map.data('trips').split(' ') || [];
  var preSelectedCountries = exports.$map.data('country').split(' ') || [];

  preSelectedTrips = _.reject(preSelectedTrips, _.isEmpty);
  preSelectedCountries = _.reject(preSelectedCountries, _.isEmpty);

  var leafletMeta = {};

  // Initialize
  $.getJSON('/world.json').done(init);

  var templateMarkerPopup = _.template(
    '<strong><%- name %>, <%- _.startCase(country) %></strong> <small><%- type %></small><br>' +
    '<% if (!visited) { %><em>planning to visit</em><br><% } %>' +
    '<% if (typeof homebase !== "undefined" && homebase) { %><em>I used to live here</em><% } %>' +
    '<% if (typeof description !== "undefined") { %><span class="description"><%- description %></span><% } %>'
  );
  var templateRoutePopup = _.template(
    '<strong><%- name %></strong> <small><%- type %></small><br>' +
    'Distance: <%- Math.round(distance / 1000) %> km'
  );

  var openPopup = exports.openPopup = function (layer) {
    // Exit if the layer isnt visible
    if (!exports.cluster.hasLayer(layer) || (!layer._icon && !layer.__parent._icon)) {
      return false;
    }
    exports.cluster.zoomToShowLayer(layer, function () {
      if (layer._popup) {
        layer.openPopup();
      }
    });
  };

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
    feature.properties.distance = _.reduce(pairs(feature.geometry.coordinates), function (total, pair) {
      return total + L.latLng(pair[0][1], pair[0][0])
        .distanceTo(L.latLng(pair[1][1], pair[1][0]));
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
    } else if (!exports.markers.hasOwnProperty(key)) {
      key = 'visited';
    }
    var marker = exports.markers[key];
    if (!feature.properties.visited) {
      marker = _.clone(marker);
      marker.color = '#999';
    }
    return L.marker(latlng, {icon: L.MakiMarkers.icon(marker)});
  }

  function getRouteStyle(feature) {
    return exports.routeStyles[feature.properties.type.toLowerCase()];
  }

  function createMap(selector) {
    var map = L.map(selector, {
      center: [18, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      scrollWheelZoom: !isSmallScreen
    });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'oxy.ndp8318l',
      accessToken: 'pk.eyJ1Ijoib3h5IiwiYSI6InBMaXRxSDAifQ.w9NqRLivEBn6BoMRkKmg3A'
    }).addTo(map);

    return map;
  }

  function prepareLayers(type, data, groupOptions) {
    var collection = _.chain(data)
      // If it's TopoJson require that there be arcs.
      .filter(function (featureGroup) {
        return featureGroup.features.type !== 'Topology' || featureGroup.features.arcs.length;
      })
      .forEach(function (featureGroup) {
        if (featureGroup.features.type === 'Topology') {
          var layer = L.geoJson(null, groupOptions);
          featureGroup.layer = omnivore.topojson.parse(featureGroup.features, null, layer);
        } else {
          featureGroup.layer = L.geoJson(featureGroup.features, groupOptions);
        }
        featureGroup.layer.type = type;
        featureGroup.layer.id = featureGroup.properties.id;
      })
      .indexBy(function (featureGroup) {
        return featureGroup.properties.name;
      })
      .value();

    return _.mapValues(collection, 'layer');
  }

  function createControl(type, layers) {
    var control = L.control.layers(null, layers, {collapsed: true}).addTo(exports.lMap);
    // Add custom classes to the leaflet control
    var container = control.getContainer();
    L.DomUtil.addClass(container, 'control-custom');
    L.DomUtil.addClass(container, 'control-' + type);

    if (!L.Browser.touch) {
      L.DomEvent
        .disableClickPropagation(container)
        .disableScrollPropagation(container);
    } else {
      L.DomEvent.disableClickPropagation(container);
    }
    return control;
  }

  function toggleControlCheckboxes(control, labels, onState) {
    // List of the layer ids corresponding the the listed labels (strings).
    var layerIds = _.chain(control._layers)
      .pick(function (layer) {
        return labels.indexOf(layer.layer.id) !== -1;
      })
      .keys()
      .value();

    // Iterate over all the checkboxes in the controls form,
    var inputs = control._form.getElementsByTagName('input');
    for (var i = 0, l = inputs.length; i < l; i++) {
      var input = inputs[i];
      // Skip checkboxes for countries not part of this trip.
      if (layerIds.indexOf(String(input.layerId)) === -1) {
        continue;
      }
      // The checkbox is already checked.
      if (onState && input.checked) {
        continue;
      }
      // The checkbox is already unchecked.
      if (!onState && !input.checked) {
        continue;
      }
      // Trigger a click so that Leaflet acts on it and triggers this
      // same event but for each country.
      $(input).trigger('click');
    }
  }

  function setTripLayerStyles(feature, layer) {
    var defaultStyle = getRouteStyle(feature);
    bindRoutePopup(feature, layer);
    layer.setStyle(defaultStyle);
    (function () {
      layer.on('mouseover', function () {
        layer.setStyle(exports.routeStyles.mouseover);
      });
      layer.on('mouseout', function () {
        layer.setStyle(defaultStyle);
      });
    })();
  }

  function createSearchControl() {
    var control = new L.Control.Search({
      layer: exports.cluster,
      propertyName: 'name',
      circleLocation: false,
      initial: false,
      autoCollapse: true,
      zoom: 10
    });

    control.on('search_locationfound', function (e) {
      openPopup(e.layer);
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
    });
    // The real layers
    var countryLayers = prepareLayers('country', countryCollection, {onEachFeature: bindMarkerPopup, pointToLayer: getMarkerIcon});
    // @see https://github.com/Leaflet/Leaflet.markercluster/issues/13
    // Create dummy layers without markers. When these are clicked, the
    // corresponding real layer will be added/removed to the
    // MarkerClusterGroup.
    var dummyLayers = {};
    _.forEach(countryLayers, function (layer, name) {
      dummyLayers[name] = L.layerGroup();
      dummyLayers[name].type = 'country';
      dummyLayers[name].id = layer.id;
      // If a pre-selected country is defiend, exit here so that it's not
      // preselected.
      if (preSelectedCountries.length && preSelectedCountries.indexOf(layer.id) === -1) {
        return;
      }
      // Dummy layer is attached to Map
      dummyLayers[name].addTo(exports.lMap);
      // Real layer is attached to MarkerClusterGroup
      exports.cluster.addLayer(layer);
    });

    // Controls point the the dummy layers.
    var countryControl = exports.controls.country = createControl('country', dummyLayers);
    // Add a mapping so that we can find the real layer alter.
    for (var row in countryControl._layers) if (countryControl._layers.hasOwnProperty(row)) {
      leafletMeta[L.Util.stamp(countryControl._layers[row].layer)] = countryControl._layers[row].name;
    }

    exports.lMap.on('overlayadd overlayremove', function (overlay) {
      var index = leafletMeta[L.Util.stamp(overlay.layer)];
      if (overlay.layer.type !== 'country') {
        return;
      }

      if (overlay.type === 'overlayadd') {
        exports.cluster.addLayer(countryLayers[index]);
      } else {
        exports.cluster.removeLayer(countryLayers[index]);
      }
    });

    return countryLayers;
  }

  function createTripLayers(tripCollection) {
    var tripLayers = prepareLayers('trip', tripCollection, {onEachFeature: setTripLayerStyles});
    if (!preSelectedCountries.length) {
      _.forEach(tripLayers, function (layer) {
        layer.addTo(exports.lMap);
      });
    }
    var tripControl = exports.controls.trip = createControl('trip', tripLayers);

    for (var row in tripControl._layers) if (tripControl._layers.hasOwnProperty(row)) {
      leafletMeta[L.Util.stamp(tripControl._layers[row].layer)] = tripControl._layers[row].name;
    }

    exports.lMap.on('overlayadd overlayremove', function (overlay) {
      var index = leafletMeta[L.Util.stamp(overlay.layer)];
      if (overlay.layer.type !== 'trip') {
        return;
      }
      var trip = tripCollection[index];
      var countries = _.pluck(trip.properties.countries, 'name');
      var control = exports.controls.country;
      var on = (overlay.type === 'overlayadd');

      toggleControlCheckboxes(control, countries, on);
    });

    if (preSelectedTrips.length) {
      _.chain(tripLayers)
        .pick(function (layer) {
          return preSelectedTrips.indexOf(layer.id) === -1;
        })
        .forEach(function (layer) {
          exports.lMap.removeLayer(layer);
        })
        .value();
    }
  }

  function init(data) {
    // Issue XHR requests for the routes of all trips, but do it async while
    // rendering regular markers.
    var tripCollection = _.forEach(data.trips, function (trip) {
      trip.promise = $.ajax({
        dataType: 'json',
        url: '/' + trip.path,
        timeout: AJAX_TIMEOUT
      });
    });

    exports.lMap.on('overlayadd overlayremove', _.debounce(function (event) {
      if (event.layer.type && event.layer.type === 'country') {
        var layers = exports.cluster.getLayers();
        if (!layers.length) {
          return;
        }
        var bounds = new L.LatLngBounds();
        for (var i = 0, l = layers.length; i < l; i++) {
          bounds.extend(layers[i].getLatLng());
        }
        exports.lMap.fitBounds(bounds);
      }
    }, 100));

    // Create the country layers.
    createCountryLayers(data.countries);
    exports.lMap.addControl(createSearchControl());

    // Wait for all requests to finish
    $.whenAll.apply(null, _.pluck(tripCollection, 'promise')).always(function () {
      tripCollection = _.chain(tripCollection)
        // Filter out failed requests.
        .pick(function (trip) {
          return trip.promise.statusCode().status === 200;
        })
        // Attach the features collected from the XHR request.
        .forEach(function (trip) {
          trip.features = trip.promise.responseJSON;
        })
        .indexBy(function (trip) {
          return trip.properties.name;
        })
        .value();

      // Create the trip layers.
      createTripLayers(tripCollection);

      if (!exports.controls.other) {
        exports.controls.other = L.control.layers(null, null, {collapsed: false}).addTo(exports.lMap);
        exports.controls.other.addOverlay(exports.cluster, 'Markers');
      }
    });
  }

  // Export ourselves.
  this.tMap = exports;
}).call(this, jQuery, this._, this.L, this.omnivore);

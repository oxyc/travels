import _ from 'lodash';
import L from 'leaflet';
import {feature as topojsonFeature} from 'topojson-client';
import 'leaflet.markercluster';
import 'leaflet-makimarkers';
import 'leaflet-search';

L.Icon.Default.imagePath = '/dist/images';
L.mapbox = L.mapbox || {};
L.mapbox.accessToken = 'pk.eyJ1Ijoib3h5IiwiYSI6InBMaXRxSDAifQ.w9NqRLivEBn6BoMRkKmg3A';
L.MakiMarkers.accessToken = L.mapbox.accessToken;

L.Control.LayersCloseAll = L.Control.Layers.extend({
  onAdd(map) {
    this._initLayout();
    this._addButton();
    this._update();

    this._map = map;
    map.on('zoomend', this._checkDisabledLayers, this);

    for (let i = 0; i < this._layers.length; i++) {
      this._layers[i].layer.on('add remove', this._onLayerChange, this);
    }

    return this._container;
  },

  _addButton() {
    const elements = this._container.querySelectorAll('.leaflet-control-layers-list');
    const button = L.DomUtil.create('button', 'button--toggle-layers', elements[0]);

    button.textContent = 'Hide all';
    L.DomEvent.on(button, 'click', function (e) {
      L.DomEvent.stop(e);
      if (button.toggled) {
        toggleControlCheckboxes(this, null, true);
        button.textContent = 'Hide all';
        button.toggled = false;
      } else {
        toggleControlCheckboxes(this, null, false);
        button.textContent = 'Show all';
        button.toggled = true;
      }
    }, this);
  }
});

export const lMap = createMap('world-map');
export const cluster = L.markerClusterGroup({maxClusterRadius: 20}).addTo(lMap);
export const controls = {};

export const markers = {
  trek: {icon: 'campsite', color: '#159957'},
  city: {icon: 'circle', color: '#659CD6'},
  park: {icon: 'park', color: '#159957'},
  homebase: {icon: 'building', color: '#D85E5E'},
  photo: {icon: 'camera', color: '#659CD6', size: 's'},
  visited: {color: '#659CD6'}
};

export const routeStyles = {
  trek: {color: '#159957', opacity: 1, weight: 5},
  route: {color: '#000', opacity: 1, weight: 2},
  tour: {color: '#000', opacity: 1, weight: 2},
  flight: {color: '#000', opacity: 0.3, weight: 2},
  boat: {color: '#2057D0', opacity: 0.3, weight: 2},
  mouseover: {color: '#ff0000', opacity: 0.7, weight: 3}
};

const map = document.querySelector('#world-map');

const preSelectedTrips = _.reject(map.dataset.trips.split(' ') || [], _.isEmpty);
const preSelectedCountries = _.reject(map.dataset.country.split(' ') || [], _.isEmpty);
const leafletMeta = {};

// Initialize
fetch('/world.json')
  .then(data => data.json())
  .then(init);

const templateMarkerPopup = _.template(
  '<strong><%- name %>, <%- _.startCase(country) %></strong> <small><%- type %></small><br>' +
  '<% if (!visited) { %><em>planning to visit</em><br><% } %>' +
  '<% if (typeof homebase !== "undefined" && homebase) { %><em>I used to live here</em><% } %>' +
  '<% if (typeof description !== "undefined") { %><span class="description"><%- description %></span><% } %>'
);
const templateRoutePopup = _.template(
  '<strong><%- name %></strong> <small><%- type %></small><br>' +
  'Distance: <%- Math.round(distance / 1000) %> km'
);

export function openPopup(layer) {
  // Exit if the layer isnt visible
  if (!cluster.hasLayer(layer) || (!layer._icon && !layer.__parent._icon)) {
    return false;
  }

  cluster.zoomToShowLayer(layer, () => {
    if (layer._popup) {
      layer.openPopup();
    }
  });
}

function pairs(array) {
  return array.slice(1).map((b, i) => [array[i], b]);
}

function bindMarkerPopup(feature, layer) {
  const content = templateMarkerPopup(feature.properties);
  layer.bindPopup(content);
}

function bindRoutePopup(feature, layer) {
  feature.properties.distance = _.reduce(pairs(feature.geometry.coordinates), (total, pair) => {
    return total + L.latLng(pair[0][1], pair[0][0])
      .distanceTo(L.latLng(pair[1][1], pair[1][0]));
  }, 0);

  const content = templateRoutePopup(feature.properties);
  layer.bindPopup(content);
}

function getMarkerIcon(feature, latlng) {
  let key = feature.properties.type.toLowerCase();
  if (feature.properties.homebase) {
    key = 'homebase';
  } else if (['national park', 'nature reserve'].includes(key)) {
    key = 'park';
  } else if (!markers[key]) {
    key = 'visited';
  }

  let marker = markers[key];
  if (!feature.properties.visited) {
    marker = _.clone(marker);
    marker.color = '#999';
  }

  return L.marker(latlng, {icon: L.MakiMarkers.icon(marker)});
}

function getRouteStyle(feature) {
  return routeStyles[feature.properties.type.toLowerCase()];
}

function createMap(selector) {
  const map = L.map(selector, {
    center: [18, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 10,
    scrollWheelZoom: true
  });

  L.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}' + (L.Browser.retina ? '@2x' : '') + '.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'oxy.ndp8318l',
    accessToken: L.mapbox.accessToken
  }).addTo(map);

  return map;
}

function prepareLayers(type, data, groupOptions) {
  const collection = _.chain(data)
    // If it's TopoJson require that there be arcs.
    .filter(featureGroup => {
      return featureGroup.features.type !== 'Topology' || featureGroup.features.arcs.length;
    })
    .forEach(featureGroup => {
      if (featureGroup.features.type === 'Topology') {
        const features = topojsonFeature(featureGroup.features, featureGroup.properties.id);
        featureGroup.layer = L.geoJson(features, groupOptions);
      } else {
        featureGroup.layer = L.geoJson(featureGroup.features, groupOptions);
      }

      featureGroup.layer.type = type;
      featureGroup.layer.id = featureGroup.properties.id;
    })
    .keyBy(featureGroup => featureGroup.properties.name)
    .value();

  return _.mapValues(collection, 'layer');
}

function createControl(type, layers) {
  const control = new L.Control.LayersCloseAll(null, layers, {collapsed: true}).addTo(lMap);

  // Add custom classes to the leaflet control
  const container = control.getContainer();
  L.DomUtil.addClass(container, 'control-custom');
  L.DomUtil.addClass(container, 'control-' + type);

  L.DomEvent.disableClickPropagation(container);

  return control;
}

function toggleControlCheckboxes(control, labels, onState) {
  // List of the layer ids corresponding the the listed labels (strings).
  let layerIds;
  if (labels && labels.length > 0) {
    layerIds = _.chain(control._layers)
      .pick(layer => labels.includes(layer.layer.id))
      .map(layer => layer.layer._leaflet_id)
      .value();
  } else {
    layerIds = _.chain(control._layers)
      .map(layer => layer.layer._leaflet_id)
      .value();
  }

  // Iterate over all the checkboxes in the controls form,
  const inputs = control._layerControlInputs;
  for (let i = 0, l = inputs.length; i < l; i++) {
    const input = inputs[i];
    // Skip checkboxes for countries not part of this trip.
    if (!layerIds.includes(input.layerId)) {
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
    input.click();
  }
}

function setTripLayerStyles(feature, layer) {
  const defaultStyle = getRouteStyle(feature);
  bindRoutePopup(feature, layer);
  layer.setStyle(defaultStyle);

  (function () { // @todo
    layer.on('mouseover', () => layer.setStyle(routeStyles.mouseover));
    layer.on('mouseout', () => layer.setStyle(defaultStyle));
  })();
}

function createSearchControl() {
  const control = new L.Control.Search({
    layer: cluster,
    propertyName: 'name',
    circleLocation: false,
    initial: false,
    autoCollapse: true,
    zoom: 10
  });

  control.on('search_locationfound', e => openPopup(e.layer));
  return control;
}

function createCountryLayers(countryCollection) {
  countryCollection = countryCollection.sort((a, b) => {
    if (a.properties.id < b.properties.id) {
      return -1;
    }

    if (a.properties.id > b.properties.id) {
      return 1;
    }

    return 0;
  });
  // The real layers
  const countryLayers = prepareLayers('country', countryCollection, {onEachFeature: bindMarkerPopup, pointToLayer: getMarkerIcon});
  // @see https://github.com/Leaflet/Leaflet.markercluster/issues/13
  // Create dummy layers without markers. When these are clicked, the
  // corresponding real layer will be added/removed to the
  // MarkerClusterGroup.
  const dummyLayers = {};
  _.forEach(countryLayers, (layer, name) => {
    dummyLayers[name] = L.layerGroup();
    dummyLayers[name].type = 'country';
    dummyLayers[name].id = layer.id;
    // If a pre-selected country is defiend, exit here so that it's not
    // preselected.
    if (preSelectedCountries.length > 0 && !preSelectedCountries.includes(layer.id)) {
      return;
    }

    // Dummy layer is attached to Map
    dummyLayers[name].addTo(lMap);
    // Real layer is attached to MarkerClusterGroup
    cluster.addLayer(layer);
  });

  // Controls point the the dummy layers.
  const countryControl = createControl('country', dummyLayers);
  controls.country = countryControl;

  // Add a mapping so that we can find the real layer alter.
  for (const row in countryControl._layers) {
    if (countryControl._layers[row]) {
      leafletMeta[L.Util.stamp(countryControl._layers[row].layer)] = countryControl._layers[row].name;
    }
  }

  lMap.on('overlayadd overlayremove', overlay => {
    const index = leafletMeta[L.Util.stamp(overlay.layer)];
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
  const tripLayers = prepareLayers('trip', tripCollection, {onEachFeature: setTripLayerStyles});
  if (preSelectedCountries.length === 0) {
    _.forEach(tripLayers, layer => layer.addTo(lMap));
  }

  const tripControl = createControl('trip', tripLayers);
  controls.trip = tripControl;

  for (const row in tripControl._layers) {
    if (tripControl._layers[row]) {
      leafletMeta[L.Util.stamp(tripControl._layers[row].layer)] = tripControl._layers[row].name;
    }
  }

  lMap.on('overlayadd overlayremove', overlay => {
    const index = leafletMeta[L.Util.stamp(overlay.layer)];
    if (overlay.layer.type !== 'trip') {
      return;
    }

    const trip = tripCollection[index];
    const countries = _.map(trip.properties.countries, 'name');
    const control = controls.country;
    const on = (overlay.type === 'overlayadd');

    toggleControlCheckboxes(control, countries, on);
  });

  if (preSelectedTrips.length > 0) {
    _.chain(tripLayers)
      .filter(layer => !preSelectedTrips.includes(layer.id))
      .forEach(layer => {
        lMap.removeLayer(layer);
      })
      .value();

    _.chain(tripLayers)
      .filter(layer => preSelectedTrips.includes(layer.id))
      .forEach(layer => {
        lMap.removeLayer(layer);
        lMap.addLayer(layer);
      })
      .value();
  }
}

function init(data) {
  // Issue XHR requests for the routes of all trips, but do it async while
  // rendering regular markers.
  let tripCollection = _.forEach(data.trips, trip => {
    trip.promise = fetch(`/${trip.path}`);
  });

  // Remove the placeholder image as it gets displayed while tiles are
  // fetched.
  lMap.once('zoomstart', () => {
    map.style.backgroundImage = 'none';
  });

  lMap.on('overlayadd overlayremove', _.debounce(event => {
    if (event.layer.type && event.layer.type === 'country') {
      const layers = cluster.getLayers();
      if (layers.length === 0) {
        return;
      }

      const bounds = new L.LatLngBounds();
      for (let i = 0, l = layers.length; i < l; i++) {
        bounds.extend(layers[i].getLatLng());
      }

      lMap.fitBounds(bounds);
    }
  }, 100));

  // Create the country layers.
  createCountryLayers(data.countries);
  lMap.addControl(createSearchControl());

  // Wait for all requests to finish
  Promise.all(_.map(tripCollection, trip => {
    return trip.promise
      .then(data => data.json())
      .catch(error => error);
  })).then(responses => {
    tripCollection = _.chain(tripCollection)
      // Attach the features collected from the XHR request.
      .forEach((trip, idx) => {
        trip.features = responses[idx];
      })
      .keyBy(trip => trip.properties.name)
      .value();

    // Create the trip layers.
    createTripLayers(tripCollection);

    if (!controls.other) {
      controls.other = L.control.layers(null, null, {collapsed: false}).addTo(lMap);
      controls.other.addOverlay(cluster, 'Markers');
    }
  });
}

var path = require('path');
var fs = require('fs');
var assert = require('assert');

var validFeatureTypes = [
  'Campground',
  'City',
  'Border Crossing',
  'Trek',
  'Sight',
  'Nomadic Village',
  'Other',
  'Pass',
  'Peak'
];

var validTrips = [
  'pct',
  'south-america-2',
  'south-america-1',
  'south-east-asia',
  'central-asia',
  'other',
  'thailand',
  'middle-east',
  'india',
  'trans-siberia'
];

function invalidElements(a, b) {
  return a.filter(function (value) {
    return b.indexOf(value) === -1;
  });
}

function verify(json) {
  assert.equal(json.type, 'FeatureCollection', 'requires the root type to be set to FeatureCollection');
  assert.equal(typeof json.properties.name, 'string', 'requires a name');
  assert.ok(json.properties.name.length > 2, 'requires a name');
  assert.ok(Array.isArray(json.features), 'requires a features array');
  json.features.forEach(function (feature) {
    assert.equal(feature.type, 'Feature', 'requires a feature to have its type set');
    assert.equal(typeof feature.properties.name, 'string', 'requires that each feature has a name');
    assert.equal(typeof feature.properties.country, 'string', 'requires that each feature has a country');
    assert.equal(typeof feature.properties.type, 'string', 'requires that each feature has a type');
    assert.ok(validFeatureTypes.indexOf(feature.properties.type) !== -1, feature.properties.type + ' is not a valid type');
    assert.equal(typeof feature.properties.visited, 'boolean', 'requires that each feature has a visited property');
    assert.equal(typeof feature.properties.trips, 'object', 'requires that each feature has a trip');
    var invalidTrips = invalidElements(feature.properties.trips, validTrips);
    assert.equal(invalidTrips.length, 0, invalidTrips.join(', ') + ' is not a valid trip');
  });
}

function main(files) {
  files.forEach(function (file) {
    var filepath = path.normalize(file);
    try {
      verify(JSON.parse(fs.readFileSync(filepath, 'utf8')));
    } catch (exception) {
      console.error('[%s] %s', file, exception.message);
    }
  });
}

main(process.argv.slice(2));

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const validFeatureTypes = [
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

const validTrips = [
  'pct',
  'south-america-2',
  'south-america-1',
  'south-east-asia',
  'central-asia',
  'other',
  'thailand',
  'middle-east',
  'india',
  'trans-siberia',
  'gdt',
  'scandinavia',
  'patagonia-antarctica',
  'south-america-vacations'
];

function invalidElements(a, b) {
  return a.filter(value => !b.includes(value));
}

function verify(json) {
  assert.strictEqual(json.type, 'FeatureCollection', 'requires the root type to be set to FeatureCollection');
  assert.strictEqual(typeof json.properties.name, 'string', 'requires a name');
  assert.ok(json.properties.name.length > 2, 'requires a name');
  assert.ok(Array.isArray(json.features), 'requires a features array');
  json.features.forEach(feature => {
    assert.strictEqual(feature.type, 'Feature', 'requires a feature to have its type set');
    assert.strictEqual(typeof feature.properties.name, 'string', 'requires that each feature has a name');
    assert.strictEqual(typeof feature.properties.country, 'string', 'requires that each feature has a country');
    assert.strictEqual(typeof feature.properties.type, 'string', 'requires that each feature has a type');
    assert.ok(validFeatureTypes.includes(feature.properties.type), feature.properties.type + ' is not a valid type');
    assert.strictEqual(typeof feature.properties.visited, 'boolean', 'requires that each feature has a visited property');
    assert.strictEqual(typeof feature.properties.trips, 'object', 'requires that each feature has a trip');
    const invalidTrips = invalidElements(feature.properties.trips, validTrips);
    assert.strictEqual(invalidTrips.length, 0, invalidTrips.join(', ') + ' is not a valid trip');
  });
}

function main(files) {
  files.forEach(file => {
    const filepath = path.normalize(file);
    try {
      verify(JSON.parse(fs.readFileSync(filepath, 'utf8')));
    } catch (error) {
      console.error('[%s] %s', file, error.message);
    }
  });
}

main(process.argv.slice(2));

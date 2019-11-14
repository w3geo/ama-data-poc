const fs = require('fs');
const path = require('path');
const toWgs84 = require('reproject').toWgs84;
const dissolve = require('geojson-dissolve');

const featureCollection = toWgs84(
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'VGD_Oesterreich_gst.geojson'), {encoding: 'utf8'})),
  'EPSG:31287', {
    'EPSG:31287': '+proj=lcc +lat_1=49 +lat_2=46 +lat_0=47.5 +lon_0=13.33333333333333 +x_0=400000 +y_0=400000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs',
  });

const gem = {};
const bez = {};
const bl = {};

featureCollection.features.forEach(feature => {
  const properties = feature.properties;
  const gkz = properties['GKZ'];
  if (!(gkz in gem)) {
    gem[gkz] = [];
  }
  gem[gkz].push(feature.geometry);
  const bkz = properties['BKZ'];
  if (!(bkz in bez)) {
    bez[bkz] = [];
  }
  bez[bkz].push(feature.geometry);
  const blkz = properties['BL_KZ'];
  if (!(blkz in bl)) {
    bl[blkz] = [];
  }
  bl[blkz].push(feature.geometry);
});

const gemFeatureCollection = {
  'type': 'FeatureCollection',
  'features': []
}
for (const gkz in gem) {
  const geometry = dissolve(gem[gkz]);
  gemFeatureCollection.features.push({
    'type': 'Feature',
    'geometry': geometry,
    'id': Number(gkz),
    'properties': {}
  })
}
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'gem.json'),
  JSON.stringify(gemFeatureCollection),
  {encoding: 'utf8'}
);

const bezFeatureCollection = {
  'type': 'FeatureCollection',
  'features': []
}
for (const bkz in bez) {
  const geometry = dissolve(bez[bkz]);
  bezFeatureCollection.features.push({
    'type': 'Feature',
    'geometry': geometry,
    'id': Number(bkz),
    'properties': {}
  })
}
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'bez.json'),
  JSON.stringify(bezFeatureCollection),
  {encoding: 'utf8'}
);

const blFeatureCollection = {
  'type': 'FeatureCollection',
  'features': []
}
for (const blkz in bl) {
  const geometry = dissolve(bl[blkz]);
  blFeatureCollection.features.push({
    'type': 'Feature',
    'geometry': geometry,
    'id': Number(blkz),
    'properties': {}
  })
}
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'bl.json'),
  JSON.stringify(blFeatureCollection),
  {encoding: 'utf8'}
);

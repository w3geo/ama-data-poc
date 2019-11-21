const fs = require('fs');
const path = require('path');
const toWgs84 = require('reproject').toWgs84;
const dissolve = require('geojson-dissolve');
const bbox = require('geojson-bbox');

const featureCollection = toWgs84(
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'VGD_Oesterreich_gst.geojson'), {encoding: 'utf8'})),
  'EPSG:31287', {
    'EPSG:31287': '+proj=lcc +lat_1=49 +lat_2=46 +lat_0=47.5 +lon_0=13.33333333333333 +x_0=400000 +y_0=400000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs',
  });

const gem = {};
const bez = {};
const bl = {};

let kgCsv = 'code;name;bbox\n'
featureCollection.features.forEach(feature => {
  const properties = feature.properties;
  const gkz = properties['GKZ'];
  if (!(gkz in gem)) {
    gem[gkz] = [];
  }
  gem[gkz].push(feature);
  const bkz = properties['BKZ'];
  if (!(bkz in bez)) {
    bez[bkz] = [];
  }
  bez[bkz].push(feature);
  const blkz = properties['BL_KZ'];
  if (!(blkz in bl)) {
    bl[blkz] = [];
  }
  bl[blkz].push(feature);
  kgCsv += `${Number(properties['KG_NR'])};${properties['KG']};${bbox(feature).map(n => n.toFixed(4))}\n`;
});
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'katastralgemeinden.csv'),
  kgCsv,
  {encoding: 'utf-8'}
)

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
let gemCsv = 'code;name;bbox\n';
gemFeatureCollection.features.forEach(feature => {
  gemCsv += `${feature.id};${gem[feature.id][0].properties['PG']};${bbox(feature).map(n => n.toFixed(4))}\n`;
});
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'gemeinden.csv'),
  gemCsv,
  {encoding: 'utf-8'}
)

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
let bezCsv = 'code;name;bbox\n';
bezFeatureCollection.features.forEach(feature => {
  bezCsv += `${feature.id};${bez[feature.id][0].properties['PB']};${bbox(feature).map(n => n.toFixed(4))}\n`;
});
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'bezirke.csv'),
  bezCsv,
  {encoding: 'utf-8'}
)

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
let blCsv = 'code;name;bbox\n';
blFeatureCollection.features.forEach(feature => {
  blCsv += `${feature.id};${bl[feature.id][0].properties['BL']};${bbox(feature).map(n => n.toFixed(4))}\n`;
});
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'bundeslaender.csv'),
  blCsv,
  {encoding: 'utf-8'}
)
const fs = require('fs');
const path = require('path');
const parseArgv = require('simple-arg-parser');
const toWgs84 = require('reproject').toWgs84;

const args = parseArgv(process.argv, [{
  name: 'topic',
  shorthand: 't',
  default: 'pct',
  description: 'Topic to extract from the csv file. Supported values are "pct" and "t1v"'
}, {
  name: "csv",
  alias: ['file'],
  shorthand: 'f',
  default: 'FULL_A3FL_ERG_2019_KUB-GROE3BETR_expdate-2019-10-03-09h03.csv',
  description: 'csv file containing the data import. Name usually starts with "FULL_A3FL_ERG_2019_KUB-GROE3BETR".'
}], {
  description: "Creates a GeoJSON file for tile generation from an input CSV file",
  defaultHelp: true
});

if (args['help']) {
  process.exit(0);
}
const topic = 'topic' in args ? args['topic'].value : 'pct';

// Read categories
const categoryData = fs.readFileSync(path.join(__dirname, '..', 'data', 'categories.csv'), {encoding: 'utf8'});
const categories = categoryData.split(/\r?\n/).map(line => line.split(';'));
categories.shift();

// Read data
const csv = 'csv' in args ?
  args['csv'].value :
  (process.env.CSV || path.join(__dirname, '..', 'data', 'FULL_A3FL_ERG_2019_KUB-GROE3BETR_expdate-2019-10-03-09h03.csv'));
const data = fs.readFileSync(csv, {encoding: 'latin1'});
const lines = data.split(/\r?\n/).map(line => line.split(';'));
const columns = lines.shift();
const column = {
  SL_KG_NR: columns.indexOf('SL_KG_NR'),
  PRODKAT_CODE: columns.indexOf('PRODKAT_CODE'),
  PRODKAT_BEZ: columns.indexOf('PRODKAT_BEZ'),
  PRODKAT_LEVEL_CODE: columns.indexOf('PRODKAT_LEVEL_CODE'),
  PRODKAT_RANK_KUB_VWE: columns.indexOf('PRODKAT_RANK_KUB_VWE'),
  PRODKAT_PROZ_FL_BEAN_KUB_VWE: columns.indexOf('PRODKAT_PROZ_FL_BEAN_KUB_VWE'),
  VWE_LEVEL_CODE: columns.indexOf('VWE_LEVEL_CODE')
}
const levels = ['FNAR', 'KUGU', 'KUAR', 'SNAR'];

// Collect product category codes for all levels
const prodkatCodes = [];
lines.forEach(line => {
  const level = levels.indexOf(line[column.PRODKAT_LEVEL_CODE]);
  if (!prodkatCodes[level]) {
    prodkatCodes[level] = {}
  }
  if (line[column.PRODKAT_BEZ]) {
    // line[column.PRODKAT_BEZ].replace('', '–') fixes a file encoding issue
    prodkatCodes[level][line[column.PRODKAT_BEZ].replace('', '–')] = line[column.PRODKAT_CODE];
  }
});

// Collect ranks and percentages for each KG
const items = {};
lines.forEach(line => {
  if (line.length === 1) {
    return;
  }
  const vwe = line[column.VWE_LEVEL_CODE];
  const level = levels.indexOf(line[column.PRODKAT_LEVEL_CODE]);
  if (vwe !== 'KG') {
    return;
  }
  const kgNr = line[column.SL_KG_NR];
  const item = kgNr in items ? items[kgNr] : {};
  const rank = Number(line[column.PRODKAT_RANK_KUB_VWE]);
  if (!rank || isNaN(rank)) {
    return;
  }

  if (topic === 't1v') {
    // Top1 variable
    for (let i = 0, ii = categories.length; i < ii; ++i) {
      if (categories[i][level] === line[column.PRODKAT_BEZ]) {
        const parentProdkatCode = level === 0 ? 'TOP' : prodkatCodes[level - 1][categories[i][level - 1]];
        if (item[`T1V_${parentProdkatCode}`] === undefined || rank < item[`T1V_${parentProdkatCode}`]) {
          item[`T1V_${parentProdkatCode}`] = rank;
          item[parentProdkatCode] = line[column.PRODKAT_CODE];
        }
      }
    }
  } else if (topic === 'pct') {
  // Percent
  const percent = Number(line[column.PRODKAT_PROZ_FL_BEAN_KUB_VWE].replace(',', '.'));
  if (percent !== 0) {
    item[`${line[column.PRODKAT_CODE]}_PCT`] = percent;
  }
}


  items[kgNr] = item;
});

// Write product codes as object literal. Codes are keys, names are values.
const prodkatCodesArray = prodkatCodes.map(codes => Object.keys(codes).reduce((prev, cur) => {
  prev[codes[cur]] = cur; return prev;
}, {}));
const prodkatCodeObject = prodkatCodesArray.reduce((prev, cur) => {Object.assign(prev, cur); return prev;}, {});
prodkatCodeObject['TOP'] = '_Gesamt';
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'prodkat-codes.json'),
  JSON.stringify(prodkatCodeObject),
  {encoding: 'utf8'}
);

// For each category, write an array of subcategories.
const subcategories = {'TOP': []};
for (let j = 0; j < 3; ++j) {
  for (let i = 0, ii = categories.length; i < ii; ++i) {
    let categoryCode = prodkatCodes[j][categories[i][j]];
    if (j === 0 && subcategories['TOP'].indexOf(categoryCode) === -1) {
      subcategories['TOP'].push(categoryCode);
    }
    if (categoryCode === undefined) {
      categoryCode = categories[i][j];
    }
    let item = subcategories[categoryCode];
    if (!item) {
      item = subcategories[categoryCode] = [];
    }
    const subcategoryCode = prodkatCodes[j + 1][categories[i][j + 1]];
    if (subcategoryCode && item.indexOf(subcategoryCode) === -1) {
      item.push(subcategoryCode);
    }
  }
}
fs.writeFileSync(path.join(__dirname, '..', 'data', 'prodkat-subcategories.json'), JSON.stringify(subcategories), {encoding: 'utf8'});

// Join data and geometries, using KG codes as join key.
const featureCollection = toWgs84(
  JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'VGD_Oesterreich_gst.geojson'), {encoding: 'utf8'})),
  'EPSG:31287', {
    'EPSG:31287': '+proj=lcc +lat_1=49 +lat_2=46 +lat_0=47.5 +lon_0=13.33333333333333 +x_0=400000 +y_0=400000 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs',
  });
featureCollection.features.forEach(feature => {
  const properties = feature.properties;
  const kgNr = properties.KG_NR;
  Object.assign(properties, items[kgNr]);
  for (const key in properties) {
    if (key.startsWith('T1V')) {
      delete properties[key];
    }
  }
  feature.id = Number(kgNr);
  delete properties.KG_NR;
  delete properties.BKZ;
  delete properties.BL;
  delete properties.BL_KZ;
  delete properties.FA;
  delete properties.FA_NR;
  delete properties.FL;
  delete properties.GB;
  delete properties.GB_KZ;
  delete properties.MERIDIAN;
  delete properties.PB;
  delete properties.PG;
  delete properties.ST;
  delete properties.ST_KZ;
  delete properties.VA;
  delete properties.VA_NR;
});

fs.writeFileSync(path.join(__dirname, '..', 'data', 'kg.json'), JSON.stringify(featureCollection), {encoding: 'utf8'});

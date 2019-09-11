const fs = require('fs');
const path = require('path');

// Read categories
const categoryData = fs.readFileSync(path.join(__dirname, '..', 'data', 'categories.csv'), {encoding: 'utf8'});
const categories = categoryData.split(/\r?\n/).map(line => line.split(';'));
categories.shift();

// Read data
const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'FULL_A3FL_ERG_2018_expdate-2019-07-18-08h34.csv'), {encoding: 'latin1'});
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
  if (level === 0 || vwe !== 'KG') {
    return;
  }
  const kgNr = line[column.SL_KG_NR];
  const item = kgNr in items ? items[kgNr] : {};
  const rank = Number(line[column.PRODKAT_RANK_KUB_VWE]);
  if (!rank || isNaN(rank)) {
    return;
  }
  for (let i = 0, ii = categories.length; i < ii; ++i) {
    if (categories[i][level] === line[column.PRODKAT_BEZ]) {
      const parentProdkatCode = prodkatCodes[level - 1][categories[i][level - 1]];
      if (item[`RANK_${parentProdkatCode}`] === undefined || rank < item[`RANK_${parentProdkatCode}`]) {
        item[`RANK_${parentProdkatCode}`] = rank;
        item[parentProdkatCode] = line[column.PRODKAT_CODE];
      }
    }
  }
  if (level === 3) {
    item[`${line[column.PRODKAT_CODE]}_PROZ`] = Number(Number(line[column.PRODKAT_PROZ_FL_BEAN_KUB_VWE].replace(',', '.')).toFixed(1));
  }
  items[kgNr] = item;
});

// Write product codes as object literal. Codes are keys, names are values.
const prodkatCodesArray = prodkatCodes.map(codes => Object.keys(codes).reduce((prev, cur) => {
  prev[codes[cur]] = cur; return prev;
}, {}));
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'prodkat-codes.json'),
  JSON.stringify(prodkatCodesArray.reduce((prev, cur) => {Object.assign(prev, cur); return prev;}, {})),
  {encoding: 'utf8'}
);

// For each category, write an array of subcategories.
const subcategories = {};
for (let j = 0; j < 3; ++j) {
  for (let i = 0, ii = categories.length; i < ii; ++i) {
    let categoryCode = prodkatCodes[j][categories[i][j]];
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
const featureCollection = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'VGD_Oesterreich_gst.geojson'), {encoding: 'utf8'}));
featureCollection.features.forEach(feature => {
  const properties = feature.properties;
  const kgNr = properties.KG_NR;
  Object.assign(properties, items[kgNr]);
  for (const key in properties) {
    if (key.startsWith('RANK')) {
      delete properties[key];
    }
  }
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

fs.writeFileSync(path.join(__dirname, '..', 'data', 'tile-data.json'), JSON.stringify(featureCollection), {encoding: 'utf8'});

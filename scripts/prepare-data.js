const fs = require('fs');
const path = require('path');

const data = fs.readFileSync(path.join(__dirname, '..', 'data', 'nurKG-SNAR_A3FL_ERG_2018_expdate-2019-07-18-08h24.csv'), {encoding: 'latin1'});
const lines = data.split('\n').map(line => line.split(';'));
const columns = lines.shift();
const column = {
  SL_KG_NR: columns.indexOf('SL_KG_NR'),
  VWE_BEAN_FL_SUM: columns.indexOf('VWE_BEAN_FL_SUM'),
  PRODKAT_CODE: columns.indexOf('PRODKAT_CODE'),
  PRODKAT_BEZ: columns.indexOf('PRODKAT_BEZ'),
  PRODKAT_FL_NETTO_KUB_VWE: columns.indexOf('PRODKAT_FL_NETTO_KUB_VWE'),
  PRODKAT_RANK_KUB_VWE: columns.indexOf('PRODKAT_RANK_KUB_VWE')
}
const useColumns = ['VWE_BEAN_FL_SUM', 'PRODKAT_FL_NETTO_KUB_VWE', 'PRODKAT_RANK_KUB_VWE'];
const names = {
  VWE_BEAN_FL_SUM: 'BEAN_FL',
  PRODKAT_FL_NETTO_KUB_VWE: 'PRODKAT_FL',
  PRODKAT_RANK_KUB_VWE: 'PRODKAT_RANK'
}
const prodkatCodes = {}
const items = {};
lines.forEach(line => {
  if (line.length === 1) {
    return;
  }
  const kgNr = line[column.SL_KG_NR];
  const item = kgNr in items ? items[kgNr] : {};
  const prodkat = line[column.PRODKAT_CODE];
  prodkatCodes[prodkat] = line[column.PRODKAT_BEZ];
  useColumns.forEach(key => {
    /** @type {number|string} */
    const value = line[column[key]];
    if (!value) {
      return;
    }
    const numeric = Number(value.replace(',', '.'));
    item[names[key].replace('PRODKAT', prodkat)] = isNaN(numeric) ? value : numeric;
  });
  items[kgNr] = item;
});
fs.writeFileSync(path.join(__dirname, '..', 'data', 'prodkat-codes.json'), JSON.stringify(prodkatCodes), {encoding: 'utf8'});

const featureCollection = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'VGD_Oesterreich_gst.geojson'), {encoding: 'utf8'}));
featureCollection.features.forEach(feature => {
  const properties = feature.properties;
  const kgNr = properties.KG_NR;
  Object.assign(properties, items[kgNr]);
  delete properties.BKZ;
  delete properties.BL;
  delete properties.BL_KZ;
  delete properties.FA;
  delete properties.FA_NR;
  delete properties.FL;
  delete properties.GB;
  delete properties.GB_KZ;
  delete properties.KG;
  delete properties.MERIDIAN;
  delete properties.PB;
  delete properties.PG;
  delete properties.ST;
  delete properties.ST_KZ;
  delete properties.VA;
  delete properties.VA_NR;
});
fs.writeFileSync(path.join(__dirname, '..', 'data', 'snar.json'), JSON.stringify(featureCollection), {encoding: 'utf8'});


import 'ol/ol.css';
import createMap, {getLayers} from 'ol-mapbox-style';

// Map state
const style = {
  version: 8,
  center: [13.3, 47.5],
  zoom: 6,
  sources: {
    tiles: {
      type: 'vector',
      tiles: './tiles/{z}/{x}/{y}.pbf',
      bounds: [9.530952,46.372652,17.162069,49.021167],
      maxzoom: 14
    }
  },
  layers: [{
    id: 'background',
    type: 'background',
    paint: {
      'background-color': '#ccc'
    }
  }, {
    id: 'top1',
    source: 'tiles',
    'source-layer': 'VGD_Oesterreich_gst',
    type: 'fill',
    filter: ['==', 'PRODKAT_RANK_K_VWE', '1'],
    paint: {
      'fill-color': 'red',
      'fill-outline-color': 'black'
    }
  }, {
    id: 'other',
    source: 'tiles',
    'source-layer': 'VGD_Oesterreich_gst',
    type: 'fill',
    filter: ['!=', 'PRODKAT_RANK_K_VWE', '1'],
    paint: {
      'fill-color': 'white',
      'fill-outline-color': 'black'
    }
  }]
}

const highlightSelect = /** @type {HTMLSelectElement} */ (document.getElementById('highlight-select'));

let joinData, kgLayer;

// Get external join data
fetch('https://gist.githubusercontent.com/ahocevar/28bebd1f59ea4d3997fb8f928543ba96/raw/b14ce45e282b2d05c49a949ad228671389ba47f3/testdata-top1.csv')
  .then(response => response.text())
  .then(text => {
    const lines = text.split('\n');
    // csv - first line contains the column names
    const columns = lines.shift().split(',');
    joinData = lines.reduce((acc, line) => {
      const values = line.split(',');
      // first value of the line contains the join id (KGNR)
      const id = values[0];
      const item = acc[id] = {};
      for (let i = 1, ii = columns.length; i < ii; ++i) {
        item[columns[i]] = values[i];
      }
      return acc;
    }, {});
    if (kgLayer) {
      kgLayer.changed();
    }
  });

createMap('map', style).then(map => {
  kgLayer = /** @type {import("ol/layer/VectorTile").default} */ (getLayers(map, 'tiles')[0]);
  let selected, selectWhat;

  // Click handler for map clicks
  map.on('click', e => {
    selectWhat = highlightSelect.options[highlightSelect.selectedIndex].value;
    const features = map.getFeaturesAtPixel(e.pixel);
    const newSelected = features ?
      (selectWhat === 'KG' ? features[0].getId() : features[0].get('GKZ')) :
      undefined;
    if (selected !== newSelected) {
      selected = newSelected;
      kgLayer.changed();
    }
  });

  // Modified style function for highlighting and joining
  const styleFunction = kgLayer.getStyleFunction();
  kgLayer.setStyle((feature, resolution) => {
    const properties = feature.getProperties();
    // join properties from joinData by join id (KGNR)
    const id = feature.getId();
    if (joinData && joinData[id]) {
      Object.assign(properties, joinData[id]);
    }
    // get the style as configured by the `style` object above
    const styles = styleFunction(feature, resolution);
    if (selected && (selectWhat === 'KG' ? feature.getId() : feature.get('GKZ')) === selected) {
      // highlighting: change style for selected KG or GKZ
      const style = styles[0];
      style.getFill().setColor('cyan');
      style.getStroke().setWidth(1e-9);
      style.setZIndex(1);
    }
    return styles;
  });

});
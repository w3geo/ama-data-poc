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
    id: 'tiles',
    source: 'tiles',
    'source-layer': 'VGD_Oesterreich_gst',
    type: 'fill',
    paint: {
      'fill-color': 'red',
      'fill-outline-color': 'black',
      'stroke-width': 1
    }
  }]
}

const highlightSelect = /** @type {HTMLSelectElement} */ (document.getElementById('highlight-select'));

createMap('map', style).then(map => {
  const kgLayer = /** @type {import("ol/layer/VectorTile").default} */ (getLayers(map, 'tiles')[0]);
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

  // Highlight style for KG
  const styleFunction = kgLayer.getStyleFunction();
  kgLayer.setStyle((feature, resolution) => {
    // get the style as configured by the `style` object above
    const styles = styleFunction(feature, resolution);
    if (selected && (selectWhat === 'KG' ? feature.getId() : feature.get('GKZ')) === selected) {
      // change style for selected KG or GKZ
      const style = styles[0];
      style.getFill().setColor('cyan');
      style.getStroke().setWidth(1e-9);
      style.setZIndex(1);
    }
    return styles;
  });

});
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
      'fill-outline-color': 'black'
    }
  }]
}

createMap('map', style).then(map => {
  const kgLayer = /** @type {import("ol/layer/VectorTile").default} */ (getLayers(map, 'tiles')[0]);
  let selected;

  // Click handler for map clicks
  map.on('click', e => {
    const features = map.getFeaturesAtPixel(e.pixel);
    const newSelected = features ? features[0].getId() : undefined;
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
    if (selected && feature.getId() === selected) {
      // change fill color for selected KG
      const style = styles[0];
      style.getFill().setColor('yellow');
    }
    return styles;
  });

});
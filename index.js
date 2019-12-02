import 'ol/ol.css';
import createMap, { getLayers } from 'ol-mapbox-style';
import { VectorTile } from 'ol/layer';
import { Style, Fill } from 'ol/style';
import styles from './src/style';
import { updateLegend } from './src/legend';
import { toLonLat, transformExtent } from 'ol/proj';
import { expression } from '@mapbox/mapbox-gl-style-spec';
import productCategories from './data/prodkat-codes.json';
import { MVT } from 'ol/src/format';

const mvt = new MVT();

const mapSelect = /** @type {HTMLSelectElement} */ (document.getElementById('map-select'));
const styleNames = Object.keys(styles).sort((a, b) => a.localeCompare(b));
for (let i = 0, ii = styleNames.length; i < ii; ++i) {
  const option = /** @type {HTMLOptionElement} */ (document.createElement('option'));
  option.value = option.innerHTML = styleNames[i];
  mapSelect.appendChild(option);
}

const highlightSelect = /** @type {HTMLSelectElement} */ (document.getElementById('highlight-select'));

let previousMap;
const configureMap = map => {
  previousMap = map;
  const kgLayer = /** @type {import("ol/layer/VectorTile").default} */ (getLayers(map, 'tiles')[0]);
  const kgSource = kgLayer.getSource();

  // Add a layer for KG/Gemeinde highlighting
  const highlightLayer = new VectorTile({
    source: kgSource,
    visible: false
  });
  map.addLayer(highlightLayer);

  let selected, selectWhat;

  // Handler for kg/gem highlighting
  map.on(['click', 'pointermove'], e => {
    selectWhat = highlightSelect.options[highlightSelect.selectedIndex].value;
    kgLayer.getFeatures(e.pixel).then(features => {
      const newSelected = features.length ?
        (selectWhat === 'KG' ? features[0].getId() : features[0].get('GKZ')) :
        undefined;
      if (selected !== newSelected) {
        selected = newSelected;
        highlightLayer.setVisible(!!selected);
        highlightLayer.changed();
      }
    });
  });

  // Style for KG/Gemeinde highlighting
  const highlightStyle = new Style({
    fill: new Fill({
      color: 'cyan'
    })
  });
  highlightLayer.setStyle(function(feature) {
    if (selected && feature.get('layer') === 'kg' && (selectWhat === 'KG' ? feature.getId() : feature.get('GKZ')) === selected) {
      return highlightStyle;
    }
  });

  const style = map.get('mapbox-style');

  // Add legend
  updateLegend(style);

  // Add mouseover
  let mouseover;
  if (style.metadata && 'ama:mouseover' in style.metadata) {
    const evaluator = expression.createExpression(style.metadata['ama:mouseover']).value;
    const evaluate = evaluator.evaluate.bind(evaluator);
    mouseover = (context, obj) => {
      const rawValue = evaluate(context, obj);
      return typeof rawValue === 'string' ? productCategories[rawValue] : (rawValue === null ? '' : rawValue + ' %');
    }
  } else {
    mouseover = () => '';
  }
  const target = map.getTargetElement();
  const mouseoverInfo = document.getElementById('mouseover-info');
  function getInfo(e) {
    if (e.dragging) {
      return;
    }
    target.title = '';
    kgLayer.getFeatures(e.pixel).then(features => {
      const feature = features.length ? features[0] : undefined;
      mouseoverInfo.innerHTML = feature ? mouseover({}, {properties: feature.getProperties()}) : '';
    });
  }
  map.on('pointermove', getInfo);
};

// select map from dropdown
mapSelect.addEventListener('change', () => {
  const previousView = previousMap.getView();
  const center = toLonLat(previousView.getCenter());
  const zoom = previousView.getZoom();
  previousMap.dispose();
  createMap('map', styles[mapSelect[mapSelect.selectedIndex].getAttribute('value')](center, zoom)).then(configureMap);
});

// Initial map
createMap('map', styles[mapSelect.firstElementChild.getAttribute('value')]()).then(map => {
  const extent = transformExtent([9.530952, 46.372652, 17.162069, 49.021167], 'EPSG:4326', 'EPSG:3857');
  map.getView().fit(extent, {padding: [5, 5, 5, 5]});
  configureMap(map);
});
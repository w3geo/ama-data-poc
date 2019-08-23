import 'ol/ol.css';
import createMap, { getLayers } from 'ol-mapbox-style';
import { VectorTile } from 'ol/layer';
import { Style, Fill } from 'ol/style';
import styles from './style';
import { toLonLat, transformExtent } from 'ol/proj';
import { expression } from '@mapbox/mapbox-gl-style-spec';
// @ts-ignore
import productCategories from './data/prodkat-codes.json';


const mapSelect = /** @type {HTMLSelectElement} */ (document.getElementById('map-select'));
for (const name in styles) {
  const option = /** @type {HTMLOptionElement} */ (document.createElement('option'));
  option.value = option.innerHTML = name;
  mapSelect.appendChild(option);
}

const highlightSelect = /** @type {HTMLSelectElement} */ (document.getElementById('highlight-select'));

let previousMap;
const configureMap = map => {
  previousMap = map;
  const kgLayer = /** @type {import("ol/layer/VectorTile").default} */ (getLayers(map, 'tiles')[0]);

  // Add a layer for KG/Gemeinde highlighting
  const highlightLayer = new VectorTile({
    source: kgLayer.getSource(),
    visible: false
  });
  map.addLayer(highlightLayer);

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
      highlightLayer.setVisible(!!selected);
      highlightLayer.changed();
    }
  });

  // Style for KG/Gemeinde highlighting
  const highlightStyle = new Style({
    fill: new Fill({
      color: 'cyan'
    })
  });
  highlightLayer.setStyle(function(feature) {
    if (selected && (selectWhat === 'KG' ? feature.getId() : feature.get('GKZ')) === selected) {
      return highlightStyle;
    }
  });

  const style = map.get('mapbox-style');

  // Add legend
  const legend = document.getElementById('legend');
  if (style.metadata && 'ama:legend' in style.metadata) {
    const legendData = style.metadata['ama:legend'];
    let legendMarkup = '<table>';
    for (const key in legendData) {
      let value = legendData[key];
      if (value in productCategories) {
        value = productCategories[value];
      }
      legendMarkup += `<tr><td style="width:16px;background-color:${key}">&nbsp;</td><td>${value}</td></tr>`;
    }
    legendMarkup += '</table>';
    legend.innerHTML = legendMarkup;
  } else {
    legend.innerHTML = '';
  }

  // Add mouseover
  let mouseover;
  if (style.metadata && 'ama:mouseover' in style.metadata) {
    const evaluator = expression.createExpression(style.metadata['ama:mouseover']).value;
    const evaluate = evaluator.evaluate.bind(evaluator);
    mouseover = (context, obj) => {
      const rawValue = evaluate(context, obj);
      return isNaN(Number(rawValue)) ? productCategories[rawValue] : rawValue + ' %';
    }
  } else {
    mouseover = () => '';
  }
  const target = map.getTargetElement();
  map.on('pointermove', e => {
    target.title = '';
    map.forEachFeatureAtPixel(e.pixel, feature => {
      target.title = mouseover({}, {properties: feature.getProperties()});
      return feature;
    })
  })
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
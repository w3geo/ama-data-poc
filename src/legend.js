import productCategories from '../data/prodkat-codes.json';
import hex2rgba from 'hex2rgba';

/**
 * @type {string}
 */
let previousExtent;

/**
 * @type {Object}
 */
let previousStyle;

/**
 * @param {import("ol/layer/VectorTile").default} layer 
 * @param {Object} style Mapbox style
 * @param {import("ol/extent").Extent} extent
 * @param {number} resolution
 */
export function updateLegend(layer, style, extent, resolution) {
  const extentString = extent.map(Math.round).toString();
  if (extentString === previousExtent && style === previousStyle) {
    return;
  }
  const source = /** @type {import("./VectorTileSource").default} */ (layer.getSource());
  const features = source.getFeaturesInExtent(extent, resolution);
  if (!features) {
    return;
  }
console.log('legend')
  previousExtent = extentString;
  previousStyle = style;  

  const styleFunction = layer.getStyleFunction();
  const colors = {};
  for (let i = 0, ii = features.length; i < ii; ++i) {
    const styles = styleFunction(features[i], resolution);
    if (styles) {
      colors[styles[0].getFill().getColor()] = true;
    }
  }
  const legend = document.getElementById('legend');
  if (style.metadata && 'ama:legend' in style.metadata) {
    const legendData = style.metadata['ama:legend'];
    let legendMarkup = '<table>';
    for (const key in legendData) {
      if (!(hex2rgba(key) in colors)) {
        continue;
      }
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
}

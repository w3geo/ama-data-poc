import productCategories from '../data/prodkat-codes.json';

export function updateLegend(style) {
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
}
// @ts-ignore
import productCategories from './data/prodkat-codes.json';

function percentStyle(prodkatCode, name, center = [13.3, 47.7], zoom = 6) {
  return {
    version: 8,
    name: name,
    center: center,
    zoom: zoom,
    sources: {
      tiles: {
        type: 'vector',
        tiles: './tiles/{z}/{x}/{y}.pbf',
        bounds: [9.530952, 46.372652, 17.162069, 49.021167],
        maxzoom: 14
      }
    },
    layers: [{
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#aaa'
      }
    }, {
      id: '0-1%',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['<', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.01],
      paint: {
        'fill-color': '#edf8fb'
      }
    }, {
      id: '1-5%',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['all', ['>=', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.01], ['<', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.05]],
      paint: {
        'fill-color': '#ccece6'
      }
    }, {
      id: '5-10%',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['all', ['>=', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.05], ['<', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.1]],
      paint: {
        'fill-color': '#99d8c9'
      }
    }, {
      id: '10-20%',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['all', ['>=', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.1], ['<', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.2]],
      paint: {
        'fill-color': '#66c2a4'
      }
    }, {
      id: '20-50%',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['all', ['>=', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.2], ['<', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.5]],
      paint: {
        'fill-color': '#2ca25f'
      }
    }, {
      id: '50-100%',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['>=', ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']], 0.5],
      paint: {
        'fill-color': '#006d2c'
      }
    }],
    metadata: {
      'ama:mouseover': ['/', ['to-number', ['get', `${prodkatCode}_FL`]], ['get', 'BEAN_FL']],
      'ama:legend': 'data:image/png;base64,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'
    }
  };
}

function rankStyle(prodkatCode, name, center = [13.3, 47.7], zoom = 6) {
  return {
    version: 8,
    name: name,
    center: center,
    zoom: zoom,
    sources: {
      tiles: {
        type: 'vector',
        tiles: './tiles/{z}/{x}/{y}.pbf',
        bounds: [9.530952, 46.372652, 17.162069, 49.021167],
        maxzoom: 14
      }
    },
    layers: [{
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#aaa'
      }
    }, {
      id: 'top1',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['==', `${prodkatCode}_RANK`, 1],
      paint: {
        'fill-color': 'red'
      }
    }, {
      id: 'other',
      source: 'tiles',
      'source-layer': 'snar',
      type: 'fill',
      filter: ['none', ['==', `${prodkatCode}_RANK`, 1]],
      paint: {
        'fill-color': 'white'
      }
    }]
  };
}

const styles = {};
for (const prodkatCode in productCategories) {
  const prodkat = productCategories[prodkatCode];
  let name;
  name = `Anteil der als ${prodkat} (bio+konventionell) genutzten Fläche an der insgesamt beantragten Fläche 2018`
  styles[name] = percentStyle.bind(this, prodkatCode, name);
  name = `${prodkat} (bio+konventionell) als dominante Nutzungsart 2018`;
  styles[name] = rankStyle.bind(this, prodkatCode, name);
}

export default styles;
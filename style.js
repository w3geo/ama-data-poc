// @ts-ignore
import productCategories from './data/prodkat-codes.json';
// @ts-ignore
import subcategories from './data/prodkat-subcategories.json';

// Color palette "plasma" from https://github.com/madams1/color_ramps/blob/d2dd9696bac07fd0cc447def8762ac1490fbc240/index.js#L268
const colors = ['#0d0887','#100788','#130789','#16078a','#19068c','#1b068d','#1d068e','#20068f','#220690','#240691','#260591','#280592','#2a0593','#2c0594','#2e0595','#2f0596','#310597','#330597','#350498','#370499','#38049a','#3a049a','#3c049b','#3e049c','#3f049c','#41049d','#43039e','#44039e','#46039f','#48039f','#4903a0','#4b03a1','#4c02a1','#4e02a2','#5002a2','#5102a3','#5302a3','#5502a4','#5601a4','#5801a4','#5901a5','#5b01a5','#5c01a6','#5e01a6','#6001a6','#6100a7','#6300a7','#6400a7','#6600a7','#6700a8','#6900a8','#6a00a8','#6c00a8','#6e00a8','#6f00a8','#7100a8','#7201a8','#7401a8','#7501a8','#7701a8','#7801a8','#7a02a8','#7b02a8','#7d03a8','#7e03a8','#8004a8','#8104a7','#8305a7','#8405a7','#8606a6','#8707a6','#8808a6','#8a09a5','#8b0aa5','#8d0ba5','#8e0ca4','#8f0da4','#910ea3','#920fa3','#9410a2','#9511a1','#9613a1','#9814a0','#99159f','#9a169f','#9c179e','#9d189d','#9e199d','#a01a9c','#a11b9b','#a21d9a','#a31e9a','#a51f99','#a62098','#a72197','#a82296','#aa2395','#ab2494','#ac2694','#ad2793','#ae2892','#b02991','#b12a90','#b22b8f','#b32c8e','#b42e8d','#b52f8c','#b6308b','#b7318a','#b83289','#ba3388','#bb3488','#bc3587','#bd3786','#be3885','#bf3984','#c03a83','#c13b82','#c23c81','#c33d80','#c43e7f','#c5407e','#c6417d','#c7427c','#c8437b','#c9447a','#ca457a','#cb4679','#cc4778','#cc4977','#cd4a76','#ce4b75','#cf4c74','#d04d73','#d14e72','#d24f71','#d35171','#d45270','#d5536f','#d5546e','#d6556d','#d7566c','#d8576b','#d9586a','#da5a6a','#da5b69','#db5c68','#dc5d67','#dd5e66','#de5f65','#de6164','#df6263','#e06363','#e16462','#e26561','#e26660','#e3685f','#e4695e','#e56a5d','#e56b5d','#e66c5c','#e76e5b','#e76f5a','#e87059','#e97158','#e97257','#ea7457','#eb7556','#eb7655','#ec7754','#ed7953','#ed7a52','#ee7b51','#ef7c51','#ef7e50','#f07f4f','#f0804e','#f1814d','#f1834c','#f2844b','#f3854b','#f3874a','#f48849','#f48948','#f58b47','#f58c46','#f68d45','#f68f44','#f79044','#f79143','#f79342','#f89441','#f89540','#f9973f','#f9983e','#f99a3e','#fa9b3d','#fa9c3c','#fa9e3b','#fb9f3a','#fba139','#fba238','#fca338','#fca537','#fca636','#fca835','#fca934','#fdab33','#fdac33','#fdae32','#fdaf31','#fdb130','#fdb22f','#fdb42f','#fdb52e','#feb72d','#feb82c','#feba2c','#febb2b','#febd2a','#febe2a','#fec029','#fdc229','#fdc328','#fdc527','#fdc627','#fdc827','#fdca26','#fdcb26','#fccd25','#fcce25','#fcd025','#fcd225','#fbd324','#fbd524','#fbd724','#fad824','#fada24','#f9dc24','#f9dd25','#f8df25','#f8e125','#f7e225','#f7e425','#f6e626','#f6e826','#f5e926','#f5eb27','#f4ed27','#f3ee27','#f3f027','#f2f227','#f1f426','#f1f525','#f0f724','#f0f921'];

/**
 * Style generator for percent maps (level 4)
 * @param {string} prodkatCode
 * @param {string} name
 * @param {Array<number>} center
 * @param {number} zoom
 */
function percentStyle(prodkatCode, name, center = [13.3, 47.7], zoom = 6) {
  return {
    version: 8,
    name: name,
    center: center,
    zoom: zoom,
    sources: {
      tiles: {
        type: 'vector',
        tiles: './tiles-pct/{z}/{x}/{y}.pbf',
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
      id: 'kg-name',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'symbol',
      minzoom: 10,
      layout: {
        'symbol-placement': 'point',
        'text-field': ['get', 'KG'],
        'text-size': 10
      },
    }, {
      id: '0-1%',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['<', ['to-number', ['get', `${prodkatCode}_PCT`]], 1],
      paint: {
        'fill-color': '#edf8fb'
      }
    }, {
      id: '1-5%',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['all', ['>=', ['to-number', ['get', `${prodkatCode}_PCT`]], 1], ['<', ['to-number', ['get', `${prodkatCode}_PCT`]], 5]],
      paint: {
        'fill-color': '#ccece6'
      }
    }, {
      id: '5-10%',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['all', ['>=', ['to-number', ['get', `${prodkatCode}_PCT`]], 5], ['<', ['to-number', ['get', `${prodkatCode}_PCT`]], 10]],
      paint: {
        'fill-color': '#99d8c9'
      }
    }, {
      id: '10-20%',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['all', ['>=', ['to-number', ['get', `${prodkatCode}_PCT`]], 10], ['<', ['to-number', ['get', `${prodkatCode}_PCT`]], 20]],
      paint: {
        'fill-color': '#66c2a4'
      }
    }, {
      id: '20-50%',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['all', ['>=', ['to-number', ['get', `${prodkatCode}_PCT`]], 20], ['<', ['to-number', ['get', `${prodkatCode}_PCT`]], 50]],
      paint: {
        'fill-color': '#2ca25f'
      }
    }, {
      id: '50-100%',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['>=', ['to-number', ['get', `${prodkatCode}_PCT`]], 50],
      paint: {
        'fill-color': '#006d2c'
      }
    }, {
      id: 'bl',
      source: 'tiles',
      'source-layer': 'bl',
      type: 'line',
      paint: {
        'line-color': 'black'
      }
    }],
    metadata: {
      'ama:mouseover': ['to-number', ['to-number', ['get', `${prodkatCode}_PCT`]]],
      'ama:legend': {
        '#edf8fb': '< 1 %',
        '#ccece6': '1 - 5 %',
        '#99d8c9': '5 - 10 %',
        '#66c2a4': '10 - 20 %',
        '#2ca25f': '20 - 50 %',
        '#006d2c': '> 50 %'
      }
    }
  };
}

/**
 * Style generator for rank maps (levels 1..3)
 * @param {string} prodkatCode
 * @param {string} name
 * @param {Array<Object<string, string>>} categories
 * @param {Array<number>} center
 * @param {number} zoom
 */
function rankStyle(prodkatCode, name, categories, center = [13.3, 47.7], zoom = 6) {
  const style = {
    version: 8,
    name: name,
    center: center,
    zoom: zoom,
    sources: {
      tiles: {
        type: 'vector',
        tiles: './tiles-t1v/{z}/{x}/{y}.pbf',
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
      id: 'kg-name',
      source: 'tiles',
      'source-layer': 'kg',
      type: 'symbol',
      minzoom: 10,
      layout: {
        'symbol-placement': 'point',
        'text-field': ['get', 'KG'],
        'text-size': 10
      },
    }],
    metadata: {
      'ama:legend': {}
    }
  };

  categories.forEach((category, i) => {
    const color = colors[Math.floor(colors.length / categories.length) * i];
    style.layers.push(/** @type {*} */ ({
      id: category,
      source: 'tiles',
      'source-layer': 'kg',
      type: 'fill',
      filter: ['==', ['get', `${prodkatCode}`], `${category}`],
      paint: {
        'fill-color': `${color}`
      }
    }));
    style.metadata['ama:legend'][color] = category;
  });
  style.layers.push(/** @type {*} */ ({
    id: 'other',
    source: 'tiles',
    'source-layer': 'kg',
    type: 'fill',
    filter: ['==', ['get', `${prodkatCode}`], null],
    paint: {
      'fill-color': '#ccc'
    }
  }));
  style.layers.push(/** @type {*} */ ({
    id: 'bl',
    source: 'tiles',
    'source-layer': 'bl',
    type: 'line',
    paint: {
      'line-color': 'black'
    }
  }))
  style.metadata['ama:mouseover'] = ['get', `${prodkatCode}`];

  return style;
}

// Generate dropdown entries for all available styles
const styles = {};
for (const prodkatCode in productCategories) {
  const prodkat = productCategories[prodkatCode];
  if (prodkatCode in subcategories) {
    const name = `${prodkat} (${prodkatCode}, bio+konventionell) - Dominante Produktkategorie (2018)`;
    styles[name] = rankStyle.bind(this, prodkatCode, name, subcategories[prodkatCode]);
  }
  if (prodkatCode === 'TOP') {
    continue;
  }
  const name = `${prodkat} (${prodkatCode}, bio+konventionell) - Anteil genutzter an beantragter Fläche (2018)`
  styles[name] = percentStyle.bind(this, prodkatCode, name);
}

export default styles;
import {VectorTile} from 'ol/source';
import { intersects } from 'ol/src/extent';

export default class VectorTileSource extends VectorTile {

  /**
   * @inheritDoc 
   */
  constructor(options) {
    super(options);

    /**
     * @type {Object<string, import("ol/VectorTile").default>}
     */
    this.availableTiles = {};

    const listenerKey = this.on('tileloadend', e => {
      const tile = e.tile;
      const key = tile.tileCoord.toString();
      this.availableTiles[key] = tile;
      const unlistenTile = e => {
        delete this.availableTiles[key];
        tile.removeEventListener('change', unlistenTile);
      };
      tile.addEventListener('change', unlistenTile);
    });
  }

  /**
   * Gets the features for a given extent and resolution
   * @param {import("ol/extent").Extent} extent
   * @param {number} resolution
   * @returns {Array<import("ol/render/Feature").default|undefined>} Matching features,
   * or undefined if no tiles were available yet for the desired resolution
   */
  getFeaturesInExtent(extent, resolution) {
    const tileGrid = this.getTileGrid();
    const z = tileGrid.getZForResolution(resolution, 1);
    let features;
    for (const key in this.availableTiles) {
      const tile = this.availableTiles[key];
      const tileCoord = tile.getTileCoord();
      if (tileCoord[0] === z) {
        if (!features) {
          features = [];
        }
        const tileFeatures = tile.getFeatures();
        for (let i = 0, ii = tileFeatures.length; i < ii; ++i) {
          const feature = /** @type {import("ol/render/Feature").default} */ (tileFeatures[i]);
          if (intersects(extent, feature.getGeometry().getExtent())) {
            features.push(feature);
          }
        }
      }
    }
    return features;
  }
}
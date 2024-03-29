# AMA Data Proof of Concept

Verwaltungsgrenzen source:
https://www.data.gv.at/katalog/dataset/51bdc6dc-25ae-41de-b8f3-938f9056af62

## Requirements

In addition to a recent [git](https://git-scm.org/) and [node](https://nodejs.org/) version, this project expects [tippecanoe](https://github.com/mapbox/tippecanoe) to be installed.

## Installation
```bash
git clone git@github.com:w3geo/ama-data-poc.git
cd ama-data-poc
npm install
```

## Importing data

Now you need to download AMA data, e.g. from  https://pydio.services.ama.at/owncloud/index.php/s/7NLnYGFmvoWbVUz (password can be obtained from Wolfgang Tinkl). When downloaded and unpacked, find the file named `FULL_A3FL_ERG_2019_KUB-GROE3BETR_expdate-2019-10-03-09h03.zip` and copy it to the `data/` directory of this project.

Finaly, we'll need to prepare our data and create tiles:
```bash
npm run data
npm run tiles
```

### Tile creation (requires Tippecanoe)

**Note:** To generate tiles for a different file, call the following scripts:
```bash
npm run external-data
CSV=path/to/MY-DATA.CSV npm run prepare-data
npm run tiles
```

### Assets for the A3FL app

* data/bundeslaender.csv - CSV with Bundesland Code, Name and Bbox
* data/bezirke.csv - CSV with Bezirk Code, Name and Bbox
* data/gemeinden.csv - CSV with Gemeinde Code, Name and Bbox
* data/katastralgemeinden.csv - CSV with Katastralgemeinde Code, Name and Bbox
* dist/tiles-pct/ - Mapbox vector tiles for percent maps
* dist/tiles-t1v/ - Mapbox vector tiles for top1 (variable) maps

## Start the application

    npm start

Open your browser at the url indicated in the terminal, usually http://localhost:8080/

## What is it about?

This proof-of-concept shows how to create many maps from a single tile set. The tile set contains rank and area for all products on all levels, for each KG. KG names and Gemeinde codes are also included.

There is a style template for rank and percentage in `style.js`. The template can also contain a legend and an expression for mouseover tooltips.

Combining the tile set with the style for a specific map, we can instantly switch between maps without loading any new data.

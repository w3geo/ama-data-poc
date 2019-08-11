# AMA Data Proof of Concept

Verwaltungsgrenzen source:
https://www.data.gv.at/katalog/dataset/51bdc6dc-25ae-41de-b8f3-938f9056af62

## Requirements

In addition to a recent [git](https://git-scm.org/) and [node](https://nodejs.org/) version, this project expects [tippecanoe](https://github.com/mapbox/tippecanoe) to be installed.

## Installation

    git clone git@github.com:w3geo/ama-data-poc.git
    cd ama-data-poc
    npm install

Now you need to download AMA data from https://pydio.services.ama.at/owncloud/index.php/s/BSGjvsiLBIPPQBU (password can be obtained from Wolfgang Tinkl). When downloaded and unpacked, find the file named `nurKG-SNAR_A3FL_ERG_2018_expdate-2019-07-18-08h24.csv` and copy it to the `data/` directory of this project.

Finaly, we'll need to prepare our data and create tiles:

    npm run data
    npm run tiles

## Start the application

    npm start

Open your browser at the url indicated in the terminal, usually http://localhost:8080/

## What is it about?

This proof-of-concept shows how to create many maps from a single tile set. The tile set contains rank and area for all products on the SNAR level.

There is a style template for rank and area in `style.js`. The template can also contain a legend and an expression for mouseover tooltips.

Combining the tile set with the style for a specific map, we can instantly switch between maps without loading any new data.

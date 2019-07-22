const path = require('path');
const HTMLWepbackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HTMLWepbackPlugin({
      template: 'index.html'
    })
  ]
}
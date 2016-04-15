// var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'www', 'dist');
var APP_DIR = path.resolve(__dirname, 'www', 'src');

var config = {
  entry: APP_DIR + '/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {test: /\.jsx?/, include: APP_DIR, loader: 'babel'},
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.scss$/, loaders: ['style', 'css', 'sass']},
      {test: /\.json$/, loader: 'json-loader'}
    ]
  }
};

module.exports = config;

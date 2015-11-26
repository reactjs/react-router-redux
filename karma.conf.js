var path = require('path');
var webpack = require('webpack');

module.exports = function (config) {

  config.set({

    browsers: [ 'Firefox' ],
    frameworks: [ 'mocha' ],
    reporters: [ 'mocha' ],

    files: [
      'test/index.js'
    ],

    preprocessors: {
      'test/index.js': [ 'webpack', 'sourcemap' ]
    },

    singleRun: true,

    webpack: {
      devtool: 'inline-source-map',
      entry: path.join(__dirname, 'test', 'index.js'),
      module: {
        preLoaders: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel'
          }
        ]
      }
    },

    webpackServer: {
      noInfo: true
    },
  });
};

var path = require('path');
var webpack = require('webpack');

module.exports = function (config) {

  var runCoverage = process.env.COVERAGE === 'true';

  var coverageLoaders = [];
  var coverageReporters = [];

  if (runCoverage) {
    coverageLoaders.push({
      test: /\.js$/,
      include: path.resolve('src/'),
      loader: 'isparta'
    }),

    coverageReporters.push('coverage');
  }

  config.set({

    browsers: [ 'Firefox' ],
    frameworks: [ 'mocha' ],
    reporters: [ 'mocha' ].concat(coverageReporters),

    files: [
      'test/index.js'
    ],

    preprocessors: {
      'test/index.js': [ 'webpack', 'sourcemap' ]
    },

    singleRun: true,

    webpack: {
      devtool: 'inline-source-map',
      module: {
        preLoaders: [
          {
            test: /\.js$/,
            exclude: [
              path.resolve('node_modules/')
            ],
            loader: 'babel'
          },
        ].concat(coverageLoaders)
      }
    },

    webpackServer: {
      noInfo: true
    },

    coverageReporter: {
      reporters: [
        { type: 'text' },
        { type: 'json', subdir: 'browser-coverage', file: 'coverage.json' }
      ]
    }
  });
};

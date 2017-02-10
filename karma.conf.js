'use strict'

const path = require('path')

module.exports = function (config) {

  let runCoverage = process.env.COVERAGE === 'true'

  let coverageLoaders = []
  let coverageReporters = []

  if (runCoverage) {
    coverageLoaders.push({
      test: /\.js$/,
      include: path.resolve('src/'),
      loader: 'isparta'
    }),

    coverageReporters.push('coverage')
  }

  config.set({

    browsers: [ 'Firefox' ],
    frameworks: [ 'mocha' ],
    reporters: [ 'mocha' ].concat(coverageReporters),

    files: [
      'tests.webpack.js'
    ],

    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },

    singleRun: true,

    webpack: {
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.js$/,
            enforce: "pre",
            use: 'babel-loader',
            include: [
              path.resolve('src/'),
              path.resolve('test/')
            ]

          }
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
  })
}

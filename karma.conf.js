var webpack = require('webpack') // eslint-disable-line

module.exports = function (config) {
  config.set({
    browsers: [ 'PhantomJS' ],
    singleRun: true,
    frameworks: [ 'mocha' ],
    files: [
      'node_modules/babel-polyfill/browser.js',
      'dist/external/neo4j-driver/lib/browser/neo4j-web.min.js',
      'tests.webpack.js'
    ],
    plugins: [ 'karma-phantomjs-launcher', 'karma-chai', 'karma-mocha',
      'karma-sourcemap-loader', 'karma-webpack', 'karma-coverage',
      'karma-mocha-reporter'
    ],
    preprocessors: {
      'tests.webpack.js': [ 'webpack', 'sourcemap' ]
    },
    reporters: [ 'mocha', 'coverage' ],
    webpack: {
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      externals: {
        'react/addons': true,
        'cheerio': 'window',
        'react/lib/ExecutionEnvironment': true,
        'react/lib/ReactContext': true
      },
      devtool: 'inline-source-map',
      module: {
        loaders: [
          { test: /\.jsx?$/, loader: 'babel', exclude: /node_modules|dist/ },
          { test: /\.css$/, loader: 'style!css' },
          { test: /\.html?$/, loader: 'html' },
          { test: /\.(jpe?g|png|gif|svg)$/i, loader: 'file?hash=sha512&digest=hex&name=[hash].[ext]' }
        ],
        postLoaders: [ {
          test: /\.jsx?$/,
          exclude: /(test|node_modules|bower_components|dist)\//,
          loader: 'istanbul-instrumenter' } ]
      }
    },
    webpackServer: {
      noInfo: true
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    }
  })
}

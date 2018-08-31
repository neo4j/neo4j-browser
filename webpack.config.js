/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const webpack = require('webpack')
const path = require('path')

const DashboardPlugin = require('webpack-dashboard/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const nodeEnv = process.env.NODE_ENV || 'development'
const isProduction = nodeEnv === 'production'

const jsSourcePath = path.join(__dirname, './src/browser')
const buildPath = path.join(__dirname, './dist')
const assetsPath = path.join(__dirname, './dist/assets')
const sourcePath = path.join(__dirname, './src/browser')

// Common plugins
const plugins = [
  new CopyWebpackPlugin([
    {
      from: {
        glob: path.resolve('./src/browser/images') + '/**/*',
        dot: false
      },
      to: assetsPath
    },
    {
      from: path.resolve('./src/browser/external/d3.min.js'),
      to: assetsPath + '/js'
    },
    {
      from: path.resolve('./src/browser/external/neoPlanner.js'),
      to: assetsPath + '/js'
    },
    {
      from: path.resolve('./src/browser/external/canvg'),
      to: assetsPath + '/js/canvg'
    }
  ]),
  new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop'),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks: Infinity,
    filename: 'vendor-[hash].js'
  }),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
  new webpack.NamedModulesPlugin(),
  new HtmlWebpackPlugin({
    template: path.join(sourcePath, 'index.html'),
    path: buildPath,
    filename: 'index.html'
  })
]

// Common rules
const rules = [
  {
    test: /\.(js|jsx)$/,
    exclude: /(node_modules)|(cypher-codemirror)/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [['es2015', { modules: false }], 'stage-2', 'react'],
          plugins: ['styled-components']
        }
      }
    ]
  },
  {
    test: /\.json$/,
    use: 'json-loader'
  },
  {
    test: /\.css$/, // Guides
    include: path.resolve('./src/browser/modules/Guides'),
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          camelCase: true,
          localIdentName: '[local]'
        }
      },
      'postcss-loader'
    ]
  },
  {
    test: /\.css$/,
    include: path.resolve('./src'), // css modules for component css files
    exclude: [
      path.resolve('./src/browser/styles'),
      path.resolve('./src/browser/modules/Guides')
    ],
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: true,
          importLoaders: 1,
          camelCase: 1,
          localIdentName: '[name]__[local]___[hash:base64:5]'
        }
      },
      'postcss-loader'
    ]
  },
  {
    test: /\.css$/, // global css files that don't need any processing
    exclude: [
      path.resolve('./src/browser/components'),
      path.resolve('./src/browser/modules')
    ],
    use: ['style-loader', 'css-loader']
  },
  {
    test: /\.coffee$/,
    exclude: /node_modules/,
    loader: 'coffee-loader'
  },
  {
    test: /\.(png|gif|jpg|svg)$/,
    include: [path.resolve('./src/browser/modules')],
    use: 'url-loader?limit=20480&name=assets/[name]-[hash].[ext]'
  },
  {
    test: /\.html?$/,
    use: ['html-loader']
  },
  {
    test: /\.svg$/,
    use:
      'file-loader?limit=65000&mimetype=image/svg+xml&name=assets/fonts/[name].[ext]'
  },
  {
    test: /\.woff$/,
    use:
      'file-loader?limit=65000&mimetype=application/font-woff&name=assets/fonts/[name].[ext]'
  },
  {
    test: /\.woff2$/,
    use:
      'file-loader?limit=65000&mimetype=application/font-woff2&name=assets/fonts/[name].[ext]'
  },
  {
    test: /\.[ot]tf$/,
    use:
      'file-loader?limit=65000&mimetype=application/octet-stream&name=assets/fonts/[name].[ext]'
  },
  {
    test: /\.eot$/,
    use:
      'file-loader?limit=65000&mimetype=application/vnd.ms-fontobject&name=assets/fonts/[name].[ext]'
  }
]

if (isProduction) {
  // Production plugins
  plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true
      },
      output: {
        comments: false
      }
    }),
    new ExtractTextPlugin('style-[hash].css')
  )
} else {
  // Development plugins
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: './../bundle-report.html'
    })
  )
}

module.exports = {
  devtool: isProduction ? 'source-map' : 'eval-source-map',
  context: jsSourcePath,
  entry: {
    js: ['index.jsx'],
    vendor: [
      'firebase',
      'neo4j-driver-alias',
      'rxjs',
      'babel-polyfill',
      'isomorphic-fetch',
      'redux-observable',
      'suber',
      'react-suber',
      'redux',
      'styled-components',
      'iconv-lite',
      'pako',
      'react-redux'
    ]
  },
  output: {
    path: buildPath,
    publicPath: '',
    filename: 'app-[hash].js',
    chunkFilename: '[name].[chunkhash].js'
  },
  module: {
    rules
  },
  resolve: {
    extensions: [
      '.webpack-loader.js',
      '.web-loader.js',
      '.loader.js',
      '.js',
      '.jsx',
      '.css',
      '.coffee'
    ],
    modules: [path.resolve(__dirname, 'node_modules'), jsSourcePath],
    alias: {
      'neo4j-driver-alias': 'neo4j-driver/lib/browser/neo4j-web.min.js',
      'src-root': path.resolve(__dirname, 'src'),
      'project-root': path.resolve(__dirname),
      services: path.resolve(__dirname, 'src/shared/services'),
      'browser-services': path.resolve(__dirname, 'src/browser/services'),
      shared: path.resolve(__dirname, 'src/shared'),
      'browser-components': path.resolve(__dirname, 'src/browser/components'),
      browser: path.resolve(__dirname, 'src/browser'),
      'browser-styles': path.resolve(__dirname, 'src/browser/styles')
    }
  },
  plugins,
  devServer: {
    contentBase: isProduction ? './build' : './src/browser',
    historyApiFallback: true,
    disableHostCheck: true,
    port: 8080,
    compress: isProduction,
    inline: !isProduction,
    hot: !isProduction,
    host: '0.0.0.0',
    stats: {
      assets: true,
      children: false,
      chunks: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m'
      }
    }
  }
}

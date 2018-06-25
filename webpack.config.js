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

const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
  new CleanWebpackPlugin('dist'),
  new CopyWebpackPlugin([
    {
      from: path.resolve('./src/browser/images'),
      to: assetsPath + '/images'
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
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
  new HtmlWebpackPlugin({
    template: path.join(sourcePath, 'index.html'),
    path: buildPath,
    filename: 'index.html'
  })
]

// Common rules
const rules = [
  {
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader', options: { inline: true, fallback: false } }
  },
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
    test: /\.css$/, // Guides
    include: path.resolve('./src/browser/modules/Guides'),
    use: [
      MiniCssExtractPlugin.loader,
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
      MiniCssExtractPlugin.loader,
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
    use: [MiniCssExtractPlugin.loader, 'css-loader']
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
    new MiniCssExtractPlugin({
      filename: 'style-[hash].css',
      chunkFilename: '[hash].css'
    })
  )
} else {
  // Development plugins
  plugins.push(
    new MiniCssExtractPlugin({
      filename: 'style-[hash].css',
      chunkFilename: '[hash].css'
    }),
    new DashboardPlugin()
  )
}
plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    reportFilename: './../bundle-report.html'
  })
)

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? false : 'cheap-module-eval-source-map',
  entry: {
    main: './src/browser/index.jsx',
    vendor: [
      'cypher-codemirror',
      'firebase',
      'neo4j-driver-alias',
      'codemirror',
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
    publicPath: '',
    path: buildPath,
    filename: isProduction ? 'app-[hash].js' : 'app.js',
    chunkFilename: isProduction ? '[name].[chunkhash].js' : '[name].js',
    globalObject: 'this'
  },
  optimization: {
    namedModules: true,
    minimizer: [
      new UglifyJsPlugin({
        uglifyOptions: {
          ecma: 6,
          output: {
            comments: false
          },
          compress: {
            dead_code: true
          }
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        default: {
          chunks: 'initial',
          minSize: 30000,
          priority: -20,
          maxAsyncRequests: 5,
          maxInitialRequests: 3,
          minChunks: 2,
          reuseExistingChunk: true
        },
        worker: {
          chunks: 'all',
          name: 'worker',
          test: /\.worker\.js$/,
          enforce: true
        },
        vendor: {
          chunks: 'initial',
          name: 'vendor',
          test: 'vendor',
          enforce: true
        },
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    }
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
    publicPath: '',
    contentBase: './dist',
    hot: true,
    open: false,
    port: 8080,
    host: '0.0.0.0'
  }
}

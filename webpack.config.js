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
const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const buildPath = path.join(__dirname, './dist')
const assetsPath = path.join(__dirname, './dist/assets')
const sourcePath = path.join(__dirname, './src/browser')

const nodeEnv = process.env.NODE_ENV || 'development'
const isProduction = nodeEnv === 'production'

const plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(nodeEnv)
    }
  }),
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
  new MiniCssExtractPlugin({
    // Options similar to the same options in webpackOptions.output
    // both options are optional
    filename: '[name].css',
    chunkFilename: '[id].css'
  }),
  new HtmlWebpackPlugin({
    template: path.join(sourcePath, 'index.html'),
    path: buildPath,
    filename: 'index.html'
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    reportFilename: './../bundle-report.html'
  })
]

if (!isProduction) {
  plugins.push(new webpack.HotModuleReplacementPlugin())
}
if (isProduction) {
  plugins.unshift(new CleanWebpackPlugin([buildPath]))
}

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/browser/index.jsx',
  output: {
    filename: 'app-[hash].js',
    publicPath: '',
    path: buildPath,
    globalObject: 'this'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  },
  plugins,
  resolve: {
    alias: {
      'neo4j-driver-alias': 'neo4j-driver/lib/browser/neo4j-web.min.js',
      'src-root': path.resolve(__dirname, 'src'),
      'project-root': path.resolve(__dirname),
      services: path.resolve(__dirname, 'src/shared/services'),
      'browser-services': path.resolve(__dirname, 'src/browser/services'),
      shared: path.resolve(__dirname, 'src/shared'),
      'browser-components': path.resolve(__dirname, 'src/browser/components'),
      browser: path.resolve(__dirname, 'src/browser'),
      'browser-styles': path.resolve(__dirname, 'src/browser/styles'),
      icons: path.resolve(__dirname, 'src/browser/icons')
    },
    extensions: [
      '.webpack-loader.js',
      '.web-loader.js',
      '.loader.js',
      '.js',
      '.jsx',
      '.css',
      '.coffee'
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)|(cypher-codemirror)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    useBuiltIns: 'entry',
                    targets: {
                      esmodules: false
                    }
                  }
                ],
                '@babel/preset-react'
              ],
              plugins: [
                'styled-components',
                'react-hot-loader/babel',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-syntax-dynamic-import'
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|gif|jpg|svg)$/,
        include: [path.resolve('./src/browser/modules')],
        use: 'file-loader?limit=20480&name=assets/[name]-[hash].[ext]'
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
        test: /\.svg$/,
        use:
          'file-loader?limit=65000&mimetype=image/svg+xml&name=assets/fonts/[name].[ext]',
        exclude: [path.resolve('./src/browser/icons')]
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader',
        include: [path.resolve('./src/browser/icons')]
      },
      {
        test: /\.coffee$/,
        exclude: /node_modules/,
        loader: 'coffee-loader'
      },
      {
        test: /\.html?$/,
        use: ['html-loader']
      }
    ]
  },
  devtool: isProduction ? false : 'inline-source-map',
  devServer: {
    port: 8080,
    disableHostCheck: true,
    hot: !isProduction
  }
}

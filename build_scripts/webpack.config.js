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

const getPlugins = require('./webpack-plugins')
const rules = require('./webpack-rules')
const path = require('path')
const helpers = require('./webpack-helpers')

module.exports = {
  mode: helpers.isProduction ? 'production' : 'development',
  entry: path.resolve(helpers.browserPath, 'index.jsx'),
  output: {
    filename: 'app-[hash].js',
    publicPath: '',
    path: helpers.buildPath,
    globalObject: 'this'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        default: false,
        vendors: false,
        // vendor chunk
        vendor: {
          // sync + async chunks
          chunks: 'all',
          // import file path containing node_modules
          test: /node_modules/
        }
      }
    }
  },
  plugins: getPlugins(),
  resolve: {
    alias: {
      'src-root': path.resolve(helpers.sourcePath),
      'project-root': path.resolve(__dirname, '../'),
      services: path.resolve(helpers.sourcePath, 'shared/services'),
      'browser-services': path.resolve(helpers.browserPath, 'services'),
      shared: path.resolve(helpers.sourcePath, 'shared'),
      'browser-components': path.resolve(helpers.browserPath, 'components'),
      browser: path.resolve(helpers.browserPath),
      'browser-styles': path.resolve(helpers.browserPath, 'styles'),
      icons: path.resolve(helpers.browserPath, 'icons')
    },
    extensions: ['.js', '.jsx']
  },
  module: {
    rules
  },
  devtool: helpers.isProduction ? false : 'inline-source-map',
  devServer: {
    port: 8080,
    disableHostCheck: true,
    hot: !helpers.isProduction
  }
}

/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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
const getPlugins = require('./webpack-plugins')
const rules = require('./webpack-rules')
const helpers = require('./webpack-helpers')

module.exports = {
  mode: helpers.isProduction ? 'production' : 'development',
  entry: [path.resolve(helpers.browserPath, 'index.jsx')],
  output: {
    filename: 'app-[hash].js',
    chunkFilename: '[name].chunkhash.bundle.js',
    publicPath: '',
    path: helpers.buildPath,
    globalObject: 'this'
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
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: true
  },
  devtool: helpers.isProduction ? false : 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    hot: !helpers.isProduction
  }
}

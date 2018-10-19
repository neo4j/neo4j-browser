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

const helpers = require('./webpack-helpers')
const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = () => {
  const plugins = [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(helpers.nodeEnv)
      }
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(helpers.browserPath, 'images'),
        to: helpers.assetsPath + '/images'
      },
      {
        from: path.resolve(helpers.browserPath, 'external/canvg'),
        to: helpers.assetsPath + '/js/canvg'
      }
    ]),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
    new HtmlWebpackPlugin({
      template: path.join(helpers.browserPath, 'index.html'),
      path: helpers.buildPath,
      filename: 'index.html'
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: './../bundle-report.html'
    })
  ]

  if (!helpers.isProduction) {
    plugins.push(new webpack.HotModuleReplacementPlugin())
  }
  if (helpers.isProduction) {
    plugins.unshift(
      new CleanWebpackPlugin([helpers.buildPath], {
        root: helpers.projectPath,
        verbose: false,
        dry: false
      })
    )
  }
  return plugins
}

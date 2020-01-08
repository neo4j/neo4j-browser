/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
const helpers = require('./webpack-helpers')
const path = require('path')

module.exports = [
  {
    test: /\.(js|jsx)$/,
    include: [
      path.resolve('src'),
      path.resolve('node_modules/@neo4j/browser-lambda-parser')
    ],
    // exclude: /(node_modules(?!:\/@neo4j))|(cypher-codemirror)|(test_utils)|(dist)/,
    use: 'babel-loader'
  },
  {
    test: /\.(png|gif|jpg|svg)$/,
    include: [
      path.resolve(helpers.browserPath, 'modules'),
      path.resolve('node_modules/@relate-by-ui/css')
    ],
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
    test: /\.less$/, // Carousel
    include: path.resolve(helpers.browserPath, 'modules/Carousel'),
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
    include: path.resolve(helpers.sourcePath), // css modules for component css files
    exclude: [
      path.resolve(helpers.browserPath, 'styles'),
      path.resolve(helpers.browserPath, 'modules/Carousel')
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
      path.resolve(helpers.browserPath, 'components'),
      path.resolve(helpers.browserPath, 'modules')
    ],
    use: ['style-loader', 'css-loader']
  },
  {
    test: /\.svg$/,
    use:
      'file-loader?limit=65000&mimetype=image/svg+xml&name=assets/fonts/[name].[ext]',
    exclude: [path.resolve(helpers.browserPath, 'icons')]
  },
  {
    test: /\.svg$/,
    loader: 'raw-loader',
    include: [path.resolve(helpers.browserPath, 'icons')]
  },
  {
    test: /\.html?$/,
    use: ['html-loader']
  }
]

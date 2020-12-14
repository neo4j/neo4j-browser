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

const path = require('path')
const getPlugins = require('./webpack-plugins')
const rules = require('./webpack-rules')
const helpers = require('./webpack-helpers')

module.exports = {
  mode: helpers.isProduction ? 'production' : 'development',
  node: {
    fs: 'empty'
  },
  entry: [path.resolve(helpers.browserPath, 'index.tsx')],
  output: {
    filename: 'app-[hash].js',
    chunkFilename: '[name].chunkhash.bundle.js',
    publicPath: '',
    path: helpers.buildPath,
    globalObject: 'this'
  },
  plugins: getPlugins(),
  resolve: {
    symlinks: false,
    alias: {
      'react-dom': '@hot-loader/react-dom',
      'project-root': path.resolve(__dirname, '../'),
      services: path.resolve(helpers.sourcePath, 'shared/services'),
      'browser-services': path.resolve(helpers.browserPath, 'services'),
      shared: path.resolve(helpers.sourcePath, 'shared'),
      'browser-components': path.resolve(helpers.browserPath, 'components'),
      'browser-hooks': path.resolve(helpers.browserPath, 'hooks'),
      browser: path.resolve(helpers.browserPath),
      'browser-styles': path.resolve(helpers.browserPath, 'styles'),
      icons: path.resolve(helpers.browserPath, 'icons')
    },
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules
  },
  optimization: helpers.isProduction
    ? {
        splitChunks: {
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom|@firebase|d3)[\\/]/,
              name: 'vendor',
              chunks: 'all',
              enforce: true
            },
            'cypher-editor': {
              test: /[\\/]node_modules[\\/](antlr4|cypher-editor-support|monaco-editor)[\\/]/,
              name: 'cypher-editor',
              chunks: 'all',
              enforce: true
            },
            mdx: {
              test: /[\\/]node_modules[\\/](@babel|@literal-jsx|@mdx-js|acorn|acorn-jsx|hast-util-raw|mdast-util-to-hast|remark-mdx|remark-parse)[\\/]/,
              name: 'mdx',
              chunks: 'all',
              enforce: true
            },
            'relate-by-ui': {
              test: /[\\/]node_modules[\\/](@relate-by-ui|semantic-ui-react)[\\/]/,
              name: 'relate-by-ui',
              chunks: 'all',
              enforce: true
            },
            'neo4j-driver': {
              test: /[\\/]node_modules[\\/](text-encoding|neo4j-driver)[\\/]/,
              name: 'neo4j-driver',
              chunks: 'all',
              enforce: true
            },
            worker: {
              test: /boltWorker/,
              name: 'worker',
              chunks: 'all',
              enforce: true
            }
          }
        }
      }
    : {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false
      },
  devtool: helpers.isProduction ? false : 'eval-cheap-module-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    disableHostCheck: true,
    hot: !helpers.isProduction
  }
}

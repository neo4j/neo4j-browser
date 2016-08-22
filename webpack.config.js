var webpack = require('webpack')
var path = require('path')
var precss = require('precss')
var TransferWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/index.jsx'
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules|dist/,
      loader: 'react-hot!babel'
    }, {
      test: /\.css$/,
      include: path.resolve('./src'),
      exclude: [path.resolve('./src/styles'), path.resolve('./src/visualisation')],
      loader: 'style!css-loader?modules&importLoaders=1&camelCase&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    }, {
      test: /\.css$/,
      exclude: [path.resolve('./src/lib'), path.resolve('./src/main'), path.resolve('./src/guides')],
      loader: 'style!css'
    }, {
      test: /\.html?$/,
      loader: 'html'
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'file?hash=sha512&digest=hex&name=[hash].[ext]'
      ]
    }]
  },
  postcss: function (webpack) {
    return [
      require('postcss-cssnext')({
        features: {
          customProperties: {
            // variables: require('./src/lib/styles/colors.json')
          }
        }
      }),
      precss
    ]
  },
  resolve: {
    root: path.resolve(__dirname),
    alias: {
      services: 'src/services',
      sagas: 'src/sagas',
      guides: 'src/guides'
    },
    modulesDirectories: ['src/lib', 'node_modules'],
    extensions: ['', '.js', '.jsx']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  externals: {
    'neo4j': 'neo4j'
  },
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new TransferWebpackPlugin([
    { from: 'node_modules/neo4j-visualization/dist/assets', to: 'assets' }
    ])
  ],
  node: {
    net: 'empty',
    tls: 'empty',
    readline: 'empty',
    fs: 'empty'
  }
}

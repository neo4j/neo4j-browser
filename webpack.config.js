var webpack = require('webpack')
var path = require('path')
var precss = require('precss')

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
      exclude: path.resolve('./src/styles'),
      loader: 'style!css-loader?modules&importLoaders=1&camelCase&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    }, {
      test: /\.css$/,
      exclude: [path.resolve('./src/lib'), path.resolve('./src/main')],
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
      require("postcss-cssnext")({
        features: {
          customProperties: {
            variables: require('./src/lib/styles/colors.json')
          }
        }
      }),
      precss
    ]
  },
  resolve: {
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
    new webpack.HotModuleReplacementPlugin()
  ],
  node: {
    net: 'empty',
    tls: 'empty',
    readline: 'empty',
    fs: 'empty'
  }
}

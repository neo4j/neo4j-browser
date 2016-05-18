var webpack = require('webpack')
var path = require('path')

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
      loader: 'style!css'
    }, {
      test: /\.html?$/,
      loader: 'html'
    }]
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

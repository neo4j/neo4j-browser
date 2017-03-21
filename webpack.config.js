var webpack = require('webpack')
var path = require('path')
var precss = require('precss')

const ENV = process.env.NODE_ENV || 'development'

module.exports = {
  entry: [
    'babel-polyfill',
    'webpack-dev-server/client?http://localhost:8080',
    'webpack/hot/only-dev-server',
    './src/browser/index.jsx'
  ],
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json-loader'
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules|dist/,
      loader: 'react-hot!babel'
    }, {
      test: /\.css$/,
      include: path.resolve('./src'),
      exclude: [path.resolve('./src/browser/styles'), path.resolve('./src/browser/modules/Guides')],
      loader: 'style!css-loader?modules&importLoaders=1&camelCase&localIdentName=[name]__[local]___[hash:base64:5]!postcss-loader'
    }, {
      test: /\.css$/,
      exclude: [path.resolve('./src/browser/components'), path.resolve('./src/browser/guides')],
      include: path.resolve('./src/browser/modules/Guides'),
      loader: 'style!css-loader?modules&importLoaders=1&camelCase&localIdentName=[local]!postcss-loader'
    }, {
      test: /\.css$/,
      exclude: [path.resolve('./src/browser/components'), path.resolve('./src/browser/modules'), path.resolve('./src/browser/guides')],
      loader: 'style!css'
    }, {
      test: /\.html?$/,
      loader: 'html'
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'url-loader?hash=sha512&digest=hex&name=[hash].[ext]'
      ]
    }, {
      test: /\.(woff|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'url-loader?name=assets/[name].[ext]'
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
    modulesDirectories: ['src/shared/modules', 'src/browser/modules', 'node_modules'],
    extensions: ['', '.js', '.jsx', '.json'],
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat'
    }
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devtool: ENV === 'production' ? 'nosources-source-map' : 'cheap-module-eval-source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NormalModuleReplacementPlugin(/\/iconv-loader$/, 'node-noop')
  ],
  node: {
    net: 'empty',
    tls: 'empty',
    readline: 'empty',
    fs: 'empty'
  }
}

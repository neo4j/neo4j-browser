module.exports = {
  entry: './src/entry-angular.js',
  output: {
    filename: 'lib/bundle-angular.js'
  },
  externals: {
    'angular': 'angular'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader'
      }
    ]
  }
}

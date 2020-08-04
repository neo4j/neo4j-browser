const webpack = require('@cypress/webpack-preprocessor')

module.exports = on => {
  const config = require('../../build_scripts/webpack.config.js')
  // To be able to import our redux actions we need to 
  // use webpack (handles typescript/aliased imports/etc)
  // We want to use the same config when running the browser normally
  // however the settings for optimzations break cypress for some reason
  delete config.optimization
  on('file:preprocessor', webpack({ webpackOptions: config }))
}

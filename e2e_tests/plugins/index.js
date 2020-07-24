// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const webpack = require('@cypress/webpack-preprocessor')

module.exports = on => {
  const config = require('../../build_scripts/webpack.config.js')
  // We want to use the same config when running the browser normally
  // however the settings for optimzations break cypress for some reason
  delete config.optimization
  on('file:preprocessor', webpack({ webpackOptions: config }))
}

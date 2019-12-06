import './commands'
import './defaults'

/* global Cypress */

afterEach(function() {
  if (this.currentTest.state === 'failed') {
    Cypress.runner.stop()
  }
})

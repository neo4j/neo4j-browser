import './commands'
import './defaults'

/* global Cypress */
before(() => {
  const log = console.error
  console.error = (e: any) => {
    const error = JSON.stringify(e)
    log(error)
    cy.log(`Got error: ${error}`)
    cy.writeFile('e2e_tests/error.log', error)
    throw new Error('Stopped because of console error')
  }
})

afterEach(function() {
  if (this.currentTest?.state === 'failed') {
    Cypress.runner.stop()
  }
})

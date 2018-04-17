const SubmitQueryButton = '[data-test-id="submitQuery"]'
const ClearEditorButton = '[data-test-id="clearEditorContent"]'
const Editor = '.ReactCodeMirror textarea'

/* global Cypress, cy */

Cypress.Commands.add('setInitialPassword', newPassword => {
  if (Cypress.env('E2E_TEST_ENV') === 'local') {
    // We assume pw already set on local
    return
  }
  cy.title().should('include', 'Neo4j Browser')

  cy
    .get('input[data-test-id="boltaddress"]')
    .clear()
    .type('bolt://localhost:7687')

  cy.get('input[data-test-id="username"]').should('have.value', 'neo4j')
  cy.get('input[data-test-id="password"]').should('have.value', '')

  cy.get('input[data-test-id="password"]').type('neo4j')

  cy.get('input[data-test-id="username"]').should('have.value', 'neo4j')

  cy.get('button[data-test-id="connect"]').click()

  // update password
  cy.get('input[data-test-id="newPassword"]')
  cy.get('input[data-test-id="newPassword"]').should('have.value', '')
  cy
    .get('input[data-test-id="newPasswordConfirmation"]')
    .should('have.value', '')

  cy.get('input[data-test-id="newPassword"]').type(newPassword)
  cy.get('input[data-test-id="newPasswordConfirmation"]').type(newPassword)
  cy.get('button[data-test-id="changePassword"]').click()

  cy.get('input[data-test-id="changePassword"]').should('not.be.visible')

  cy.get('input[data-test-id="connect"]').should('not.be.visible')
  cy.wait(500)
  cy
    .get('[data-test-id="frameCommand"]')
    .first()
    .should('contain', ':play start')
})
Cypress.Commands.add('connect', password => {
  cy.title().should('include', 'Neo4j Browser')
  cy
    .get('input[data-test-id="boltaddress"]')
    .clear()
    .type('bolt://localhost:7687')

  cy.get('input[data-test-id="username"]').should('have.value', 'neo4j')
  cy.get('input[data-test-id="password"]').should('have.value', '')

  cy.get('input[data-test-id="password"]').type(password)

  cy.get('input[data-test-id="username"]').should('have.value', 'neo4j')

  cy.get('button[data-test-id="connect"]').click()
  cy.get('[data-test-id="frame"]', { timeout: 10000 }).should('have.length', 2)
  cy.wait(500)
  cy
    .get('[data-test-id="frameCommand"]')
    .first()
    .should('contain', ':play start')
})
Cypress.Commands.add('disconnect', () => {
  const query = ':server disconnect'
  cy.executeCommand(query)
})
Cypress.Commands.add('executeCommand', query => {
  cy.get(ClearEditorButton).click()
  cy.get(Editor).type(query, { force: true })
  cy.get(Editor).should('have.value', query)
  cy.get(SubmitQueryButton).click()
})

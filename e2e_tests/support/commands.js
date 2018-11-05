const SubmitQueryButton = '[data-test-id="submitQuery"]'
const ClearEditorButton = '[data-test-id="clearEditorContent"]'
const Editor = '.ReactCodeMirror textarea'

/* global Cypress, cy */

Cypress.Commands.add(
  'setInitialPassword',
  (
    newPassword,
    initialPassword = 'neo4j',
    username = 'neo4j',
    boltUrl = Cypress.config('boltUrl'),
    force = false
  ) => {
    if (Cypress.env('E2E_TEST_ENV') === 'local' && !force) {
      // We assume pw already set on local
      return
    }
    cy.title().should('include', 'Neo4j Browser')

    cy.get('input[data-test-id="boltaddress"]')
      .clear()
      .type(boltUrl)

    cy.get('input[data-test-id="username"]')
      .clear()
      .type(username)
    cy.get('input[data-test-id="password"]').type(initialPassword)

    cy.get('button[data-test-id="connect"]').click()

    // update password
    cy.get('input[data-test-id="newPassword"]')
    cy.get('input[data-test-id="newPassword"]').should('have.value', '')
    cy.get('input[data-test-id="newPasswordConfirmation"]').should(
      'have.value',
      ''
    )

    cy.get('input[data-test-id="newPassword"]').type(newPassword)
    cy.get('input[data-test-id="newPasswordConfirmation"]').type(newPassword)
    cy.get('button[data-test-id="changePassword"]').click()

    cy.get('input[data-test-id="changePassword"]').should('not.be.visible')
    cy.get('[data-test-id="frameCommand"]', { timeout: 10000 }).should(
      'contain',
      ':play start'
    )
  }
)
Cypress.Commands.add(
  'connect',
  (
    username,
    password,
    boltUrl = Cypress.config('boltUrl'),
    makeAssertions = true
  ) => {
    cy.executeCommand(':server disconnect')
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')

    cy.get('input[data-test-id="boltaddress"]')
      .clear()
      .type(boltUrl)

    cy.get('input[data-test-id="username"]')
      .clear()
      .type(username)
    cy.get('input[data-test-id="password"]')
      .clear()
      .type(password)

    cy.get('button[data-test-id="connect"]').click()
    if (makeAssertions) {
      cy.get('[data-test-id="frame"]', { timeout: 10000 }).should(
        'have.length',
        2
      )
      cy.wait(500)
      cy.get('[data-test-id="frameCommand"]')
        .first()
        .should('contain', ':play start')
      cy.executeCommand(':clear')
    }
  }
)
Cypress.Commands.add('disconnect', () => {
  const query = ':server disconnect'
  cy.executeCommand(query)
})
Cypress.Commands.add('executeCommand', query => {
  cy.get(ClearEditorButton).click()
  cy.get(Editor).type(query, { force: true })
  cy.get(SubmitQueryButton).click()
})
Cypress.Commands.add('disableEditorAutocomplete', () => {
  cy.get(ClearEditorButton).click()
  cy.executeCommand(`:config editorAutocomplete: false`)
  cy.get(SubmitQueryButton).click()
  cy.executeCommand(`:clear`)
})
Cypress.Commands.add('enableEditorAutocomplete', () => {
  cy.get(ClearEditorButton).click()
  cy.executeCommand(`:config editorAutocomplete: true`)
  cy.get(SubmitQueryButton).click()
  cy.executeCommand(`:clear`)
})
Cypress.Commands.add('waitForCommandResult', () => {
  cy.get('[data-test-id="frame-loaded-contents"]', { timeout: 40000 }).should(
    'be.visible'
  )
})
Cypress.Commands.add('resultContains', str => {
  cy.get('[data-test-id="frameContents"]', { timeout: 40000 }).should(
    'contain',
    str
  )
})

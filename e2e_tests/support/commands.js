const SubmitQueryButton = '[data-testid="submitQuery"]'
const ClearEditorButton = '[data-testid="clearEditorContent"]'
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

    cy.get('input[data-testid="boltaddress"]')
      .clear()
      .type(boltUrl)

    cy.get('input[data-testid="username"]')
      .clear()
      .type(username)
    cy.get('input[data-testid="password"]').type(initialPassword)

    cy.get('button[data-testid="connect"]').click()

    // update password
    cy.get('input[data-testid="newPassword"]')
    cy.get('input[data-testid="newPassword"]').should('have.value', '')
    cy.get('input[data-testid="newPasswordConfirmation"]').should(
      'have.value',
      ''
    )

    cy.get('input[data-testid="newPassword"]').type(newPassword)
    cy.get('input[data-testid="newPasswordConfirmation"]').type(newPassword)
    cy.get('button[data-testid="changePassword"]').click()

    cy.get('input[data-testid="changePassword"]').should('not.be.visible')
    cy.get('[data-testid="frameCommand"]', { timeout: 10000 }).should(
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

    cy.get('input[data-testid="boltaddress"]')
      .clear()
      .type(boltUrl)

    cy.get('input[data-testid="username"]')
      .clear()
      .type(username)
    cy.get('input[data-testid="password"]')
      .clear()
      .type(password)

    cy.get('button[data-testid="connect"]').click()
    if (makeAssertions) {
      cy.get('[data-testid="frame"]', { timeout: 10000 }).should(
        'have.length',
        2
      )
      cy.wait(500)
      cy.get('[data-testid="frameCommand"]')
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
  cy.get('[data-testid="frame-loaded-contents"]', { timeout: 40000 }).should(
    'be.visible'
  )
})
Cypress.Commands.add('resultContains', str => {
  cy.get('[data-testid="frameContents"]', { timeout: 40000 }).should(
    'contain',
    str
  )
})

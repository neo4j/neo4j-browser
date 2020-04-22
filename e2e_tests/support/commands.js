import { isAura } from './utils'

const SubmitQueryButton = '[data-testid="submitQuery"]'
const ClearEditorButton = '[data-testid="clearEditorContent"]'
const Editor = '.ReactCodeMirror textarea'
const VisibleEditor = '[data-testid="editor-wrapper"]'

/* global Cypress, cy */

Cypress.Commands.add('getEditor', () => cy.get(VisibleEditor))
Cypress.Commands.add('getFrames', () => cy.get('[data-testid="frame"]'))
Cypress.Commands.add('getPrevInFrameStackBtn', () =>
  cy.get('[data-testid="prev-in-stack-button"]')
)
Cypress.Commands.add('getNextInFrameStackBtn', () =>
  cy.get('[data-testid="next-in-stack-button"]')
)

Cypress.Commands.add(
  'setInitialPassword',
  (
    newPassword,
    initialPassword = 'neo4j',
    username = 'neo4j',
    boltUrl = Cypress.config('boltUrl'),
    force = false
  ) => {
    if (!Cypress.config('setInitialPassword') && !force) {
      // We assume pw already set on local
      return
    }

    cy.title().should('include', 'Neo4j Browser')
    cy.wait(3000)

    cy.get('input[data-testid="boltaddress"]')
      .clear()
      .type(boltUrl)

    cy.get('input[data-testid="username"]')
      .clear()
      .type(username)
    cy.get('input[data-testid="password"]').type(initialPassword)

    cy.get('button[data-testid="connect"]').click()

    // update password
    cy.get('input[data-testid="newPassword"]', { timeout: 20000 })
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
      cy.get('[data-testid="frame"]', { timeout: 25000 }).should(
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
Cypress.Commands.add('executeCommand', (query, options = {}) => {
  cy.get(ClearEditorButton).click()
  cy.get(Editor).type(query, { force: true, ...options })
  cy.wait(100)
  cy.get(SubmitQueryButton).click()
  cy.wait(1000)
})
Cypress.Commands.add('disableEditorAutocomplete', () => {
  cy.get(ClearEditorButton).click()
  cy.executeCommand(':config editorAutocomplete: false')
  cy.get(SubmitQueryButton).click()
  cy.executeCommand(':clear')
})
Cypress.Commands.add('enableEditorAutocomplete', () => {
  cy.get(ClearEditorButton).click()
  cy.executeCommand(':config editorAutocomplete: true')
  cy.get(SubmitQueryButton).click()
  cy.executeCommand(':clear')
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
Cypress.Commands.add('addUser', (userName, password, role, force) => {
  cy.get('[id*=username]')
  cy.get('[id*=username]').type(userName)
  cy.get('[id*=password]')
    .first()
    .type(password)
  cy.get('[id*=password-confirm]').type(password)
  cy.get('[id*=roles-selector]').select(role)
  if (force === true) {
    cy.get('[type=checkbox]').click()
  }
  cy.get('[class*=Button]')
    .contains('Add User')
    .click()
})
Cypress.Commands.add('enableMultiStatement', () => {
  cy.get('[data-testid="drawerSettings"]').click()
  cy.get('[data-testid="enableMultiStatementMode"]').check()
  cy.get('[data-testid="drawerSettings"]').click()
})
Cypress.Commands.add('disableMultiStatement', () => {
  cy.get('[data-testid="drawerSettings"]').click()
  cy.get('[data-testid="enableMultiStatementMode"]').uncheck()
  cy.get('[data-testid="drawerSettings"]').click()
})
Cypress.Commands.add('createUser', (username, password, forceChangePw) => {
  cy.dropUser(username)
  if (Cypress.config('serverVersion') >= 4.0) {
    cy.executeCommand(':use system')
    cy.executeCommand(
      `CREATE USER ${username} SET PASSWORD "${password}" CHANGE ${
        forceChangePw ? '' : 'NOT '
      }REQUIRED`
    )
  } else {
    cy.executeCommand(`CALL dbms.security.deleteUser("${username}")`)
    cy.executeCommand(':clear')
    cy.executeCommand(
      `CALL dbms.security.createUser("${username}", "${password}", ${
        forceChangePw ? 'true' : 'false'
      })`
    )
  }
})
Cypress.Commands.add('dropUser', username => {
  if (Cypress.config('serverVersion') >= 4.0) {
    cy.executeCommand(':use system')
    cy.executeCommand(`DROP USER ${username}`)
    cy.executeCommand(':clear')
  } else {
    cy.executeCommand(`CALL dbms.security.deleteUser("${username}")`)
    cy.executeCommand(':clear')
  }
})

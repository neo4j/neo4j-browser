export const SubmitQueryButton = '[data-testid="editor-Run"]'
const EditorTextField = '[data-testid="activeEditor"] textarea'
const VisibleEditor = '#monaco-main-editor'
/* global Cypress, cy */
export const selectAllAndDelete =
  Cypress.platform === 'darwin' ? '{cmd}a {backspace}' : '{ctrl}a {backspace}'

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

    cy.get('input[data-testid="boltaddress"]').clear().type(boltUrl)

    cy.get('input[data-testid="username"]').clear().type(username)
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

    cy.get('input[data-testid="changePassword"]').should('not.exist')
    cy.get('[data-testid="frame"]', { timeout: 25000 }).should('have.length', 2)
    cy.get('[data-testid="frameCommand"]', { timeout: 30000 }).contains(
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

    cy.get('input[data-testid="boltaddress"]').clear().type(boltUrl)

    cy.get('input[data-testid="username"]').clear().type(username)
    cy.get('input[data-testid="password"]').clear().type(password)

    cy.get('button[data-testid="connect"]').click()
    if (makeAssertions) {
      cy.get('[data-testid="frame"]', { timeout: 25000 }).should(
        'have.length',
        2
      )
      cy.wait(500)
      cy.get('[data-testid="frameCommand"]').contains(':server connect')
      cy.executeCommand(':clear')
    }
  }
)
Cypress.Commands.add('disconnect', () => {
  const query = ':server disconnect'
  cy.executeCommand(query)
})

Cypress.Commands.add('typeInFrame', (cmd: string, frameIndex = 0) => {
  cy.get('[id^=monaco-] textarea')
    .should('have.length.at.least', frameIndex + 1)
    .eq(frameIndex + 1) // the first monaco editor is the main one
    .type(
      Cypress.platform === 'darwin'
        ? '{cmd}a {backspace}'
        : '{ctrl}a {backspace}'
    )
    .type(cmd)
})

Cypress.Commands.add('executeCommand', (query, options = {}) => {
  cy.get(VisibleEditor).click()
  cy.get(EditorTextField).type(query, { force: true, ...options })
  cy.wait(100)
  cy.get(SubmitQueryButton).click()
  cy.wait(1000)
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
  cy.get('[id*=password]').first().type(password)
  cy.get('[id*=password-confirm]').type(password)
  cy.get('[id*=roles-selector]').select(role)
  if (force === true) {
    cy.get('[type=checkbox]').click()
  }
  cy.get('[data-testid="Add User"]').click()
})
Cypress.Commands.add('enableMultiStatement', () => {
  cy.get('[data-testid="navigationSettings"]').click()
  cy.get('[data-testid="setting-enableMultiStatementMode"]', {
    timeout: 30000
  }).check({
    force: true
  })
  cy.get('[data-testid="navigationSettings"]').click()
})
Cypress.Commands.add('disableMultiStatement', () => {
  cy.get('[data-testid="navigationSettings"]').click()
  cy.get('[data-testid="setting-enableMultiStatementMode"]', {
    timeout: 30000
  }).uncheck({ force: true })
  cy.get('[data-testid="navigationSettings"]').click()
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

Cypress.Commands.add(
  'ensureConnection',
  (creds = { username: 'neo4j', password: Cypress.config('password') }) => {
    cy.contains('Database access not available').then(res => {
      if (res) {
        cy.connect(creds.username, creds.password)
      }
    })
  }
)

Cypress.Commands.add('createDatabase', (dbName: string) => {
  cy.executeCommand(`DROP DATABASE ${dbName} IF EXISTS;`)
  cy.executeCommand(':clear')
  cy.executeCommand(`CREATE DATABASE ${dbName}`)
  cy.contains('1 system update, no records')

  pollForDbOnline()

  function pollForDbOnline(totalWaitMs = 0) {
    if (totalWaitMs > 6000) {
      throw new Error('Database did not come online')
    }

    cy.get('[data-testid="frameCommand"]').click()
    cy.typeInFrame(`SHOW DATABASE ${dbName} YIELD currentStatus{enter}`)
    cy.get('[data-testid="frameContents"] [role="cell"] span').then(
      statusSpan => {
        if (statusSpan.text().includes('online')) {
          // started properly, clear stream & carry on.
          cy.executeCommand(':clear')
        } else {
          cy.wait(500)
          pollForDbOnline(totalWaitMs + 500)
        }
      }
    )
  }
})

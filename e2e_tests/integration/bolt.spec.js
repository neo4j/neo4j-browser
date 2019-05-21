/*
 * Copyright (c) 2002-2019 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global Cypress, cy, test, expect, before */

describe('Bolt connections', () => {
  before(function () {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(5000)
  })
  it('can show connection error', () => {
    const password = 'unlikely password'
    cy.connect(
      'neo4j',
      password,
      undefined,
      false
    )
  })
  it('show "no connection" error when not using web workers', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':config useCypherThread: false')
    cy.executeCommand('RETURN 1')
    cy.resultContains('No connection found, did you connect to Neo4j')
  })
  it('show "no connection" error when using web workers', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':config useCypherThread: true')
    cy.executeCommand('RETURN 1')
    cy.resultContains('No connection found, did you connect to Neo4j')
  })
  it('does not show the "Reconnect" banner when trying to connect', () => {
    cy.connect(
      'neo4j',
      'x',
      'bolt://localhost:7685',
      false
    ) // Non open port
    cy.wait(10000)
    cy.get('[data-testid="reconnectBanner"]').should('not.be.visible')
    cy.get('[data-testid="disconnectedBanner"]').should('be.visible')
    cy.get('[data-testid="main"]', { timeout: 1000 })
      .and('contain', 'Database access not available')
      .should('not.contain', 'Connection lost')
  })
  it('users with no role can connect', () => {
    cy.executeCommand(':clear')
    const password = Cypress.config('password')
    cy.connect(
      'neo4j',
      password
    )
    cy.executeCommand('CALL dbms.security.deleteUser("no-roles")')
    cy.executeCommand(':clear')
    cy.executeCommand('CALL dbms.security.createUser("no-roles", "pw", true)')
    cy.executeCommand(':server disconnect')
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')

    // Make sure initial pw set works
    cy.setInitialPassword(
      '.',
      'pw',
      'no-roles',
      Cypress.config('boltUrl'),
      true
    )

    // Try regular connect
    cy.executeCommand(':server disconnect')
    cy.connect(
      'no-roles',
      '.'
    )
  })
  it('displays user info in sidebar (when connected)', () => {
    cy.executeCommand(':clear')
    cy.get('[data-testid="drawerDBMS"]').click()
    cy.get('[data-testid="user-details-username"]').should(
      'contain',
      'no-roles'
    )
    cy.get('[data-testid="user-details-roles"]').should('contain', '-')
    cy.get('[data-testid="drawerDBMS"]').click()
  })
})

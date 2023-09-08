/*
 * Copyright (c) Neo4j
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

describe('Sign in with keycloak', () => {
  before(function () {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
  })

  it('can login', () => {
    cy.executeCommand(':server disconnect')
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')
    cy.get('[data-testid=boltaddress]').type('localhost:7687')
    cy.get('[data-testid="authenticationMethod"]').select('Single Sign On')
    cy.contains('Keycloak').click()

    // might do automatic redirect depending
    cy.wait(5000)
    cy.get('body').then($body => {
      if ($body.find('#username').length > 0) {
        cy.get('#username').type('admin')
        cy.get('#password').type('password{enter}')
      }
    })

    cy.title().should('include', 'Neo4j Browser')
    cy.wait(3000)
    cy.contains('You are connected').should('exist')
    cy.executeCommand(
      'create (t :Location {{}name: "Ambrette Town"{}}) return t.name'
    )
    cy.waitForCommandResult()
    cy.resultContains('Ambrette Town')
    cy.executeCommand(':debug')
    cy.contains('SSO Connection to Neo4j successfully established').should(
      'exist'
    )

    cy.wait(7 * 60 * 1000)

    cy.executeCommand(':clear')

    // first command after timeout may fail
    cy.executeCommand('RETURN 123')
    cy.waitForCommandResult()

    cy.executeCommand(
      'create (t :Location {{}name: "Pastoria City"{}}) return t.name'
    )
    cy.waitForCommandResult()
    cy.resultContains('Pastoria City')
    cy.executeCommand(':clear')
    // sidebar has new label
    cy.get('[data-testid="navigationDBMS"]').click()
    cy.contains('Location')

    cy.executeCommand(':debug')
    cy.contains('Successfully refreshed token').should('exist')
    cy.contains('Connection recovered successfully').should('exist')
  })
})

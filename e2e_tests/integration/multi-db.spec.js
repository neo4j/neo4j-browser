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

/* global Cypress, cy, test, expect, before, after */

describe('Multi database', () => {
  const databaseList = () =>
    cy.get('[data-testid="dbs-command-list"] li', {
      timeout: 5000
    })

  before(() => {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(5000)
  })
  after(() => {})
  it('can connect', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  if (Cypress.config('serverVersion') >= 4.0) {
    it(':use command works + shows current db in editor gutter', () => {
      cy.executeCommand(':clear')
      const editor = () => cy.get('[data-testid="editor-wrapper"]')

      editor().contains('neo4j$')

      cy.executeCommand(':use system')
      editor().contains('system$')

      cy.executeCommand(':use neo4j')
      editor().contains('neo4j$')
    })

    it('lists databases in sidebar', () => {
      cy.executeCommand(':clear')
      cy.get('[data-testid="drawerDBMS"]').click()

      const databaseList = () =>
        cy.get('[data-testid="database-selection-list"] option', {
          timeout: 5000
        })

      databaseList().should('have.length', 2)

      cy.executeCommand(':use system')
      cy.executeCommand('CREATE DATABASE sidebartest')
      databaseList().should('have.length', 3)
      databaseList().contains('system')
      databaseList().contains('neo4j')
      databaseList().contains('sidebartest')

      cy.executeCommand('DROP DATABASE sidebartest')
      databaseList().should('have.length', 2)
      cy.get('[data-testid="drawerDBMS"]').click()
    })

    it('lists databases with :dbs command', () => {
      cy.executeCommand(':clear')

      cy.executeCommand(':dbs')

      databaseList().should('have.length', 2)
      databaseList().contains('system')
      databaseList().contains('neo4j')

      cy.executeCommand(':use system')
      cy.executeCommand('CREATE DATABASE sidebartest')

      cy.wait(3000) // CREATE database can take a sec

      cy.executeCommand(':clear')
      cy.executeCommand(':dbs')
      databaseList().should('have.length', 3)
      databaseList().contains('system')
      databaseList().contains('neo4j')
      databaseList().contains('sidebartest')

      cy.executeCommand('DROP DATABASE sidebartest')
      cy.executeCommand(':clear')
      cy.executeCommand(':dbs')
      databaseList().should('have.length', 2)
      databaseList().contains('system')
      databaseList().contains('neo4j')
    })
    it('user with no roles can lists databases with :dbs command but cant run cypher', () => {
      cy.executeCommand(':clear')
      cy.createUser('noroles', 'pw1', false)
      cy.executeCommand(':server disconnect')
      cy.executeCommand(':clear')
      cy.executeCommand(':server connect')
      cy.connect('noroles', 'pw1')

      // Try to list dbs, should work
      cy.executeCommand(':dbs')
      databaseList().should('have.length', 2)
      databaseList().contains('system')
      databaseList().contains('neo4j')

      // Try to run Cypher, shoudl show error
      cy.executeCommand('RETURN 1')
      const resultFrame = cy
        .get('[data-testid="frame"]', { timeout: 10000 })
        .first()
      resultFrame.should('contain', 'Neo.ClientError.Security.Forbidden')
      resultFrame.should('contain', 'List available databases')

      // Cleanup
      cy.executeCommand(':server disconnect')
      cy.executeCommand(':clear')
      cy.connect('neo4j', Cypress.config('password'))
      cy.dropUser('noroles')
    })
  }
})

/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

import { isEnterpriseEdition } from '../support/utils'

/* global Cypress, cy, test, expect, before, after */

describe('Multi database', () => {
  const databaseList = () =>
    cy.get('[data-testid="dbs-command-list"] li', {
      timeout: 5000
    })
  const databaseOptionListOptions = () =>
    cy.get('[data-testid="database-selection-list"] option', {
      timeout: 5000
    })
  const databaseOptionList = () =>
    cy.get('[data-testid="database-selection-list"]', {
      timeout: 5000
    })

  before(() => {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  after(() => {})
  it('can connect', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  if (Cypress.config('serverVersion') >= 4.0) {
    if (isEnterpriseEdition()) {
      it('shows a message indicating whether system updates have occured', () => {
        cy.executeCommand(':clear')

        cy.executeCommand(':use system')
        cy.executeCommand('CREATE DATABASE test1')

        cy.wait(3000) // CREATE database can take a sec

        cy.resultContains('1 system update, no records')

        cy.executeCommand('STOP DATABASE test1')
        cy.wait(1000)
        cy.resultContains('1 system update, no records')

        cy.executeCommand('STOP DATABASE test1')
        cy.wait(1000)
        if (Cypress.config('serverVersion') >= 4.1) {
          cy.resultContains('1 system update, no records')
        } else {
          cy.resultContains('no changes, no records')
        }

        cy.executeCommand('DROP DATABASE test1')
        cy.executeCommand(':clear')
      })
    }
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
      databaseOptionListOptions().should('have.length', 2)
      cy.get('[data-testid="drawerDBMS"]').click()
    })
    if (isEnterpriseEdition()) {
      it('adds databases to the sidebar and adds backticks to special db names', () => {
        // Add db
        cy.executeCommand(':use system')
        cy.executeCommand('CREATE DATABASE `name-with-dash`')
        cy.resultContains('1 system update')
        cy.executeCommand(':clear')

        // Count items in list
        cy.get('[data-testid="drawerDBMS"]').click()
        databaseOptionListOptions().should('have.length', 3)
        databaseOptionListOptions().contains('system')
        databaseOptionListOptions().contains('neo4j')
        databaseOptionListOptions().contains('name-with-dash')

        // Select to use db, make sure backticked
        databaseOptionList().select('name-with-dash')
        cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
          .first()
          .should('contain', ':use `name-with-dash`')
        cy.resultContains(
          'Queries from this point and forward are using the database'
        )

        // Try without backticks
        cy.executeCommand(':use system')
        cy.resultContains(
          'Queries from this point and forward are using the database'
        )
        cy.executeCommand(':clear')
        cy.executeCommand(':use name-with-dash')
        cy.resultContains(
          'Queries from this point and forward are using the database'
        )

        // Cleanup
        cy.executeCommand(':use system')
        cy.executeCommand('DROP DATABASE `name-with-dash`')
        databaseOptionListOptions().should('have.length', 2)
        cy.get('[data-testid="drawerDBMS"]').click()
      })
    }

    it('lists databases with :dbs command', () => {
      cy.executeCommand(':clear')

      cy.executeCommand(':dbs')

      databaseList().should('have.length', 2)
      databaseList().contains('system')
      databaseList().contains('neo4j')

      cy.executeCommand(':use system')
    })
    if (isEnterpriseEdition()) {
      it('lists new databases with :dbs command', () => {
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
    }
    it('shows error message when trying to set a parameter on system db', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(':use system')
      cy.executeCommand(':param x => 1')
      const resultFrame = cy
        .get('[data-testid="frame"]', { timeout: 10000 })
        .first()
      resultFrame.should('contain', 'cannot be declared')
    })
    it('shows error when trying to use a db that doesnt exist', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(':use nonexistingdb')
      const resultFrame = cy
        .get('[data-testid="frame"]', { timeout: 10000 })
        .first()
      resultFrame.should('contain', 'could not be found')
    })
    if (isEnterpriseEdition()) {
      it('re-runs query from frame action button on original db', () => {
        cy.executeCommand(':clear')
        cy.executeCommand(':use neo4j')
        cy.executeCommand(':clear')
        cy.executeCommand('RETURN "Test string"')
        cy.executeCommand(':use system')

        // Close first frame
        cy.get('[title="Close"]', { timeout: 10000 })
          .first()
          .click()

        // Make sure it's closed
        cy.get('[data-testid="frame"]', { timeout: 10000 }).should(
          'have.length',
          1
        )

        // Click re-run
        cy.get('[data-testid="rerunFrameButton"]', { timeout: 10000 })
          .first()
          .click()

        // Make sure we have what we expect
        cy.get('[data-testid="frame"]', { timeout: 10000 })
          .first()
          .should(frame => {
            expect(frame).to.contain('"Test string"')
            expect(frame).to.not.contain('ERROR')
          })
      })
    }
  }
})

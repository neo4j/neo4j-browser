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

/* global Cypress, cy, before */

describe('Schema Frame', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  it('can connect', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  describe('renders schema', () => {
    before(function() {
      cy.executeCommand(
        'CREATE (n:SchemaTest {{}prop1: "foo", prop2: "bar"{}})'
      )

      if (Cypress.config('serverVersion') >= 4.0) {
        cy.executeCommand(
          'CREATE INDEX compositeIndex FOR (n:SchemaTest) ON (n.prop1, n.prop2)'
        )
      } else {
        cy.executeCommand('CREATE INDEX ON :SchemaTest(prop1, prop2)')
      }

      cy.executeCommand(
        'CREATE CONSTRAINT ON (n:SchemaTest) ASSERT n.prop1 IS UNIQUE'
      )
    })
    after(function() {
      if (Cypress.config('serverVersion') >= 4.0) {
        cy.executeCommand('DROP INDEX compositeIndex')
      } else {
        cy.executeCommand('DROP INDEX ON :SchemaTest(prop1, prop2)')
      }

      cy.executeCommand(
        'DROP CONSTRAINT ON (n:SchemaTest) ASSERT n.prop1 IS UNIQUE'
      )
      cy.executeCommand('MATCH (n:SchemaTest ) DETACH DELETE n')
    })

    it('renders indexes correctly', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(':schema')

      // Headers
      if (Cypress.config('serverVersion') >= 4.0) {
        cy.get('[data-testid="frameContents"]')
          .should('contain', 'Index Name')
          .and('contain', 'LabelsOrTypes')
          .and('contain', 'Properties')
          .and('contain', 'State')
      } else {
        cy.get('[data-testid="frameContents"]').should('contain', 'Indexes')
      }

      // Index info
      if (Cypress.config('serverVersion') >= 4.0) {
        cy.get('[data-testid="frameContents"]').should(
          'contain',
          'compositeIndex'
        )
      }

      cy.get('[data-testid="frameContents"]')
        .should('contain', 'SchemaTest')
        .and('contain', 'prop1')
        .and('contain', 'prop2')
    })

    it('renders constraints correctly', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(':schema')

      if (Cypress.config('serverVersion') <= 4.0) {
        cy.get('[data-testid="frameContents"]')
          .should('contain', 'Constraints')
          .and('contain', 'schematest.prop1')
          .and('contain', 'IS UNIQUE')
      }

      if (Cypress.config('serverVersion') >= 4.1) {
        cy.get('[data-testid="frameContents"]')
          .should('contain', 'Constraints')
          .and('contain', 'SchemaTest {prop1}')
          .and('contain', "type='UNIQUENESS'")
      }
    })
  })
})

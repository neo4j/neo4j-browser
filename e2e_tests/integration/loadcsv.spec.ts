/*
 * Copyright (c) 2002-2021 "Neo4j,"
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

describe('LOAD CSV', () => {
  before(function () {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  it('can connect', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  it('imports without periodic commit', () => {
    if (Cypress.config('includeImportTests')) {
      cy.executeCommand(':clear')
      cy.executeCommand('MATCH (n) DETACH DELETE n')
      cy.executeCommand(`LOAD CSV WITH HEADERS FROM 'file:///import.csv' AS row{shift}{enter}
    CREATE (p:Person {{}name: row.name, born: toInteger(row.born), city: row.city, comment:row.comment});`)

      cy.resultContains('Added 3 labels, created 3 nodes, set 11 properties,')

      cy.executeCommand(
        'MATCH (n:Person {{}born: 2012}) RETURN n.city, n.comment'
      )
      cy.resultContains('"Borås"')
      cy.resultContains('"I like unicorns, and "flying unicorns""')
    }
  })
  it('imports with periodic commit', () => {
    if (
      Cypress.config('includeImportTests') &&
      Cypress.config('serverVersion') < 5
    ) {
      const periodicQuery = `USING PERIODIC COMMIT 1{shift}{enter}
    LOAD CSV WITH HEADERS FROM 'file:///import.csv' AS row 
    CREATE (p:Person {{}name: row.name, born: toInteger(row.born), city: row.city, comment:row.comment});`

      // Let's see it fail when not using auto-committed tx's first
      cy.executeCommand(':clear')
      cy.executeCommand(periodicQuery)
      cy.resultContains('Neo.ClientError.Statement.SemanticError')

      cy.executeCommand(':clear')
      cy.executeCommand('MATCH (n) DETACH DELETE n')
      cy.executeCommand(`:auto ${periodicQuery}`)

      cy.resultContains('Added 3 labels, created 3 nodes, set 11 properties,')

      cy.executeCommand(
        'MATCH (n:Person {{}born: 2012}) RETURN n.city, n.comment'
      )
      cy.resultContains('"Borås"')
      cy.resultContains('"I like unicorns, and "flying unicorns""')
    }
  })
})

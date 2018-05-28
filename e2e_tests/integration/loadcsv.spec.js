/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

/* global Cypress, cy, test, expect */

describe('LOAD CSV', () => {
  it('can connect', () => {
    const password = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.connect('neo4j', password)
  })
  it('imports without periodic commit', () => {
    if (!Cypress.config.includeImportTests) {
      return
    }
    cy.executeCommand(':clear')
    cy.executeCommand('MATCH (n) DETACH DELETE n')
    cy.executeCommand(`LOAD CSV WITH HEADERS FROM 'file:///import.csv' AS row 
    CREATE (p:Person {{}name: row.name, born: toInteger(row.born), city: row.city, comment:row.comment});`)

    cy.resultContains('Added 3 labels, created 3 nodes, set 11 properties,')

    cy.executeCommand(
      'MATCH (n:Person {{}born: 2012}) RETURN n.city, n.comment'
    )
    cy.resultContains('"Borås"')
    cy.resultContains('"I like unicorns, and "flying unicorns""')
  })
  it('imports with periodic commit', () => {
    if (!Cypress.config.includeImportTests) {
      return
    }
    cy.executeCommand(':clear')
    cy.executeCommand('MATCH (n) DETACH DELETE n')
    cy.executeCommand(`USING PERIODIC COMMIT 1
    LOAD CSV WITH HEADERS FROM 'file:///import.csv' AS row 
    CREATE (p:Person {{}name: row.name, born: toInteger(row.born), city: row.city, comment:row.comment});`)

    cy.resultContains('Added 3 labels, created 3 nodes, set 11 properties,')

    cy.executeCommand(
      'MATCH (n:Person {{}born: 2012}) RETURN n.city, n.comment'
    )
    cy.resultContains('"Borås"')
    cy.resultContains('"I like unicorns, and "flying unicorns""')
  })
})

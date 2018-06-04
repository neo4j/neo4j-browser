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

/* global cy, test, expect */

describe('Bolt connections', () => {
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
    cy.connect('neo4j', 'x', 'bolt://localhost:7685', false) // Non open port
    cy.wait(10000)
    cy.get('[data-test-id="reconnectBanner"]').should('not.be.visible')
    cy.get('[data-test-id="disconnectedBanner"]').should('be.visible')
    cy
      .get('[data-test-id="main"]', { timeout: 1000 })
      .and('contain', 'Database access not available')
      .should('not.contain', 'Connection lost')
  })
})

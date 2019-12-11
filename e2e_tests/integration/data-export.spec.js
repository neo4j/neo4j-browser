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

/* global Cypress, cy, before */

describe('Data export', () => {
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
  it('shows export buttons on viz load', () => {
    cy.executeCommand(':clear')
    cy.executeCommand('CREATE (n:ExportTest) RETURN n')

    cy.get('[data-testid="frame"]', { timeout: 10000 }).should('have.length', 1)
    cy.get('[data-testid="frame-export-dropdown"]')
      .first()
      .trigger('mouseover')
    cy.get('[data-testid="frame-export-dropdown"]')
      .first()
      .should('contain', 'Export PNG')

    cy.executeCommand('MATCH (n:ExportTest) DETACH DELETE n')
  })
})

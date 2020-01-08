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

describe('Viz rendering', () => {
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
  it('shows legend with rel types + node labels on first render', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(
      'CREATE (a:TestLabel)-[:CONNECTS]->(b:TestLabel) RETURN a, b'
    )
    cy.get('[data-testid="viz-legend-reltypes"]', { timeout: 5000 }).contains(
      'CONNECTS'
    )
    cy.get('[data-testid="viz-legend-labels"]', { timeout: 5000 }).contains(
      'TestLabel'
    )
    cy.executeCommand('MATCH (a:TestLabel) DETACH DELETE a')
  })
})

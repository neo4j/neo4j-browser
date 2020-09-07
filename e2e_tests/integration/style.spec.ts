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

describe(':style', () => {
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
  it('print the current style', () => {
    cy.executeCommand(':clear')
    cy.executeCommand('CREATE (n:Style) RETURN n') // To generate any style

    cy.waitForCommandResult()

    const query = ':style'
    cy.executeCommand(query)
    cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy.get('[data-testid="frameContents"]', { timeout: 10000 })
      .first()
      .should('contain', 'node {')
      .should('contain', 'relationship {')
      .should('contain', '"<type>"')
  })
  it('can reset style with button', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':style')
    cy.get('[data-testid="exportGrassButton"]', { timeout: 10000 })
    cy.get('[data-testid="styleResetButton"]', { timeout: 10000 })
      .first()
      .click()
    cy.get('[data-testid="frameContents"]', { timeout: 10000 })
      .first()
      .should('contain', 'No style generated or set yet')
  })
})

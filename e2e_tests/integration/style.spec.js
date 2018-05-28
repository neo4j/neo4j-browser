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

describe(':style', () => {
  it('can connect', () => {
    cy.executeCommand(':server disconnect')
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')
    const password = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.connect(password)
  })
  it('print the current style', () => {
    cy.executeCommand(':clear')
    cy.executeCommand('CREATE (n:Style) RETURN n') // To generate any style
    const query = ':style'
    cy.executeCommand(query)
    cy
      .get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy
      .get('[data-test-id="frameContents"]', { timeout: 10000 })
      .first()
      .should('contain', 'node {')
      .should('contain', 'relationship {')
      .should('contain', '"<type>"')
  })
  it('can reset style with button', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':style')
    cy.get('[data-test-id="exportGrassButton"]', { timeout: 10000 })
    cy
      .get('[data-test-id="styleResetButton"]', { timeout: 10000 })
      .first()
      .click()
    cy
      .get('[data-test-id="rerunFrameButton"]', { timeout: 10000 })
      .first()
      .click()

    cy
      .get('[data-test-id="frameContents"]', { timeout: 10000 })
      .first()
      .should('not.contain', 'node {')
  })
})

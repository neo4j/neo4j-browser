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

describe('Settings', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })

  it('should be able to set max frames', () => {
    // write some commands
    cy.executeCommand('RETURN 1')
    cy.executeCommand('RETURN 2')
    cy.executeCommand('RETURN 3')

    // change settings to 1, make sure it is cut to 1
    cy.get('[data-testid="navigationSettings"]').click()
    cy.get('input[data-testid="setting-maxFrames"]')
      .clear()
      .type('1')
    // close settings again
    cy.get('[data-testid="navigationSettings"]').click()

    cy.get('[data-testid="frame"]').should('have.length', 1)
    cy.get('[data-testid="frame"]').should('contain', 'RETURN 3')

    // write some commands, make sure not more than one frame at a time
    cy.executeCommand('RETURN 1')
    cy.executeCommand('RETURN 2')

    cy.get('[data-testid="frame"]').should('have.length', 1)

    // reload page
    cy.reload()
    cy.get('[data-testid="frame"]').should('have.length', 1, { timeout: 3000 })

    // write some commands, make sure not more than one frame at a time
    cy.executeCommand('RETURN 1')
    cy.executeCommand('RETURN 2')

    cy.get('[data-testid="frame"]').should('have.length', 1)

    // change settings to 3, then write commands and make sure it will be set to 3 frames at most
    cy.get('[data-testid="navigationSettings"]').click()
    cy.get('input[data-testid="setting-maxFrames"]')
      .clear()
      .type('3')
    // close settings again
    cy.get('[data-testid="navigationSettings"]').click()
    cy.executeCommand('RETURN 1')
    cy.executeCommand('RETURN 2')
    cy.executeCommand('RETURN 3')
    cy.executeCommand('RETURN 4')

    cy.get('[data-testid="frame"]').should('have.length', 3)
  })
})

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

/* global Cypress, cy, test, expect, before */

describe('Help command', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  it('can `:help` command', () => {
    cy.executeCommand(':clear')
    const query = ':help'
    cy.executeCommand(query)

    let frame = cy.getFrames()

    // Make sure first loads
    frame
      .should('have.length', 1)
      .should('contain', 'Neo4j Browser is a command shell')

    // Click a help topic
    frame.contains('help commands').click()

    frame = cy.getFrames()

    // Make sure it loads in same frame
    frame
      .should('have.length', 1)
      .should('contain', 'In addition to composing and running Cypher queries')

    // Click back in stack
    cy.getPrevInFrameStackBtn().click()
    frame = cy.getFrames()

    // Make sure we're back
    frame
      .should('have.length', 1)
      .should('contain', 'Neo4j Browser is a command shell')

    // Click forward
    cy.getNextInFrameStackBtn().click()
    frame = cy.getFrames()
    frame
      .should('have.length', 1)
      .should('contain', 'In addition to composing and running Cypher queries')

    // Click new topic
    frame.contains('help auto').click()
    frame = cy.getFrames()

    frame
      .should('have.length', 1)
      .should(
        'contain',
        'Execute a Cypher query within an auto-committing transaction'
      )

    // Then click back twice
    cy.getPrevInFrameStackBtn().click()
    cy.getPrevInFrameStackBtn().click()
    frame = cy.getFrames()

    // And we should be back
    frame
      .should('have.length', 1)
      .should('contain', 'Neo4j Browser is a command shell')

    // Click something else
    frame.contains('play concepts').click()

    // We should now have two frames
    cy.getFrames().should('have.length', 2)
  })
})

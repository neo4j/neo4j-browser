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

const nextSlideBtn = () => cy.get('[data-testid="nextSlide"]')

describe('Play command', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  it('can `:help` command', () => {
    cy.executeCommand(':clear')
    const query = ':play start'
    cy.executeCommand(query)

    let frame = cy.getFrames()

    // Make sure first loads
    frame.should('have.length', 1).should('contain', 'Learn about Neo4j')

    // Click a guide button
    frame.contains('Start Learning').click()

    frame = cy.getFrames()

    // Make sure it loads in same frame
    frame.should('have.length', 1).should('contain', 'Graph Fundamentals')

    // Click back in stack
    cy.getPrevInFrameStackBtn().click()
    frame = cy.getFrames()

    // Make sure we're back
    frame.should('have.length', 1).should('contain', 'Learn about Neo4j')

    // Go to next again
    cy.getNextInFrameStackBtn().click()

    // Click forward 7 times (to last slide)
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()

    frame = cy.getFrames()

    frame.should('have.length', 1).should('contain', 'Keep getting started')

    // Click new guide
    frame.contains('The Movie Graph').click()
    frame = cy.getFrames()

    frame.should('have.length', 1).should('contain', 'Pop-cultural connections')

    // Then click back in stack once
    cy.getPrevInFrameStackBtn().click()
    // Click to last slide again
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()

    frame = cy.getFrames()
    frame.should('have.length', 1).should('contain', 'Keep getting started')

    // Click next in stack
    cy.getNextInFrameStackBtn().click()
    frame = cy.getFrames()

    // And we should be back on the movie
    frame.should('have.length', 1).should('contain', 'Pop-cultural connections')
  })
})

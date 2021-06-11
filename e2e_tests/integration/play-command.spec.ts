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

const nextSlideBtn = () => cy.get('[data-testid="nextSlide"]')

describe('Play command', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  it('can stack `:play` commands', () => {
    cy.executeCommand(':clear')
    const query = ':play intro'
    cy.executeCommand(query)

    let frame = cy.getFrames()

    // Make sure first loads
    frame.should('have.length', 1).should('contain', 'command driven client')

    // Click forward to the last slide
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()

    frame = cy.getFrames()

    frame.should('have.length', 1).should('contain', 'Next steps')

    // Click new guide
    frame.contains('Play Cypher').click()
    frame = cy.getFrames()

    frame.should('have.length', 1).should('contain', 'SQL-like clauses')

    // Then click back in stack once
    cy.getPrevInFrameStackBtn().click()
    // Click to last slide again
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()
    nextSlideBtn().click()

    frame = cy.getFrames()
    frame.should('have.length', 1).should('contain', 'Next steps')

    // Click next in stack
    cy.getNextInFrameStackBtn().click()
    frame = cy.getFrames()

    // And we should be back play cypher
    frame.should('have.length', 1).should('contain', 'SQL-like clauses')
  })
  it('can execute remote types of `:play`', () => {
    cy.executeCommand(':clear')

    // Existing guide
    cy.executeCommand(':play reco')
    cy.getFrames().should(
      'contain',
      'Welcome to the Neo4j recommendations training'
    )

    // Next slide
    nextSlideBtn().click()

    // Click link to new guide
    cy.contains('Procedures').trigger('click')

    // Assert
    cy.getFrames()
      .should('have.length', 1)
      .should('contain', 'Procedures are a new feature in')

    // Click back in stack
    cy.getPrevInFrameStackBtn().click()

    // Assert
    cy.getFrames()
      .should('have.length', 1)
      .should('contain', 'Welcome to the Neo4j recommendations training')
  })
  it('handles not found guides', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':play not-found-guide-anywhere')

    cy.getFrames()
      .should('have.length', 1)
      .should('contain', 'No guide')
  })
  it('can link to a specific slide', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':play concepts#slide-3')

    // Assert
    cy.getFrames()
      .should('have.length', 1)
      .should('contain', 'labels') // slide #3 is about labels
  })
})

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

describe('Guide command', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })

  it('handles not found guides', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':guide not-found-guide-anywhere')

    cy.get('[data-testid="guidesDrawer"]').should('contain', 'Not found')

    // reset state
    cy.executeCommand(':guide')
    cy.get('[data-testid="guidesDrawer"]').should('contain', ':guide movie')
    cy.get('[data-testid=navigationGuides]').click()
  })

  it('can walk through a guide', () => {
    cy.executeCommand(':clear')
    // Open a guide from the sidebar
    cy.get('[data-testid=navigationGuides]').click()
    cy.get('[data-testid="guidesDrawer"]')
      .contains(':guide cypher')
      .click()

    // Can progress slide
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid="guidesDrawer"]').contains('CREATE')

    // Remembers slide location
    cy.get('[data-testid=navigationGuides]').click()
    cy.get('[data-testid=navigationGuides]').click()
    cy.get('[data-testid="guidesDrawer"]').contains('CREATE')

    // Can go to previous slide
    cy.get('[data-testid=guidePreviousSlide]').click()
    cy.get('[data-testid="guidesDrawer"]').contains('SQL-like clauses')

    // Go to end
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid="guidesDrawer"]').contains('Next steps')

    // Switch guide via command
    cy.executeCommand(':guide northwind')
    cy.get('[data-testid="guidesDrawer"]').contains('From RDBMS to Graph')

    // Jump to end
    cy.get('[data-testid="pagination-11"]').click()
    cy.get('[data-testid="guidesDrawer"]').contains(
      'Full Northwind import example'
    )

    // Can use back button
    cy.get('[data-testid="guidesBackButton"]').click()
    // Same built-in guide won't be added twice
    cy.get(`[data-testid="builtInGuidenorthwind-graph"]`).should(
      'have.length',
      1
    )
    cy.get('[data-testid="guidesDrawer"]').contains(':guide cypher')

    cy.get('[data-testid=navigationGuides]').click()
  })

  it('can load and persist a remote guide and can be deleted permanantly', () => {
    const guideUrl = 'https://guides.neo4j.com/sandbox/movies/index.html'
    cy.executeCommand(':clear')
    cy.executeCommand(`:guide ${guideUrl}`, { timeout: 50000 })
    cy.get('[data-testid="guidesDrawer"]').should('contain', 'Movies Guide')
    cy.get('[data-testid="guidesDrawer"]').should('contain', 'What is Cypher?')

    // The item is added into Remote Guides
    cy.get('[data-testid="guidesBackButton"]').click()
    cy.get('[data-testid="guidesDrawer"]').contains('Remote Guides')

    // Can display the remote guide after clicking the item
    cy.get('[data-testid="guidesDrawer"]')
      .contains('Movies Guide')
      .click()
    cy.get('[data-testid="guidesDrawer"]').should('contain', 'Movies Guide')
    cy.get('[data-testid="guidesDrawer"]').should('contain', 'What is Cypher?')

    // Same remote guide won't be added twice
    cy.executeCommand(`:guide ${guideUrl}`, { timeout: 3000 })
    cy.get('[data-testid="guidesBackButton"]').click()
    cy.get(`[data-testid="removeGuide${guideUrl}"]`).should('have.length', 1)

    // Reload the page
    cy.reload().then(() => {
      // Open guides drawer
      cy.get('[data-testid="navigationGuides"]').click()
      cy.get('[data-testid="guidesDrawer"]').contains('Remote Guides')

      // Can display the remote guide after clicking the item
      cy.get('[data-testid="guidesDrawer"]')
        .contains('Movies Guide')
        .click()
      cy.get('[data-testid="guidesDrawer"]').should('contain', 'Movies Guide')
      cy.get('[data-testid="guidesDrawer"]').should(
        'contain',
        'What is Cypher?'
      )

      // Can click delete button to remote the guide
      cy.get('[data-testid="guidesBackButton"]').click()
      cy.get('[data-testid="guidesDrawer"]')
        .should('contain', 'Movies Guide')
        .get(`[data-testid="removeGuide${guideUrl}"]`)
        .click({ force: true })
      cy.get(`[data-testid="remoteGuide${guideUrl}"]`).should('not.exist')
      cy.get('[data-testid="remoteGuidesTitle"]').should('not.exist')

      // Reload again and confirm the remote guide no longer exists
      cy.reload().then(() => {
        // Open guides drawer
        cy.get('[data-testid="navigationGuides"]').click()
        cy.get(`[data-testid="remoteGuide${guideUrl}"]`).should('not.exist')
        cy.get('[data-testid="remoteGuidesTitle"]').should('not.exist')
      })
    })
  })
})

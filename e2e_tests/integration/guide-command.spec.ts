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

    cy.get('[data-testid="guideDrawer"]').should('contain', 'Not found')

    // reset state
    cy.executeCommand(':guide')
    cy.get('[data-testid="guideDrawer"]').should('contain', ':guide movie')
    cy.get('[data-testid=drawerGuides]').click()
  })

  it('can walk through a guides', () => {
    cy.executeCommand(':clear')
    // Open a guide from the sidebar
    cy.get('[data-testid=drawerGuides]').click()
    cy.get('[data-testid="guideDrawer"]')
      .contains(':guide cypher')
      .click()

    // can progress slide
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid="guideDrawer"]').contains('CREATE')

    // remembers slide location
    cy.get('[data-testid=drawerGuides]').click()
    cy.get('[data-testid=drawerGuides]').click()

    // can go back
    cy.get('[data-testid="guideDrawer"]').contains('CREATE')
    cy.get('[data-testid=guidePreviousSlide]').click()
    cy.get('[data-testid="guideDrawer"]').contains('SQL-like clauses')

    // go to end
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid=guideNextSlide]').click()
    cy.get('[data-testid="guideDrawer"]').contains('Next steps')

    // switch guide via command
    cy.executeCommand(':guide northwind')
    cy.get('[data-testid="guideDrawer"]').contains('From RDBMS to Graph')

    // Jump to end, then new guide
    cy.get('[data-testid="pagination-7"]').click()
    cy.get('[data-testid="guideDrawer"]')
      .contains('Movie Graph')
      .click()

    cy.get('[data-testid="guideDrawer"]').contains('mini graph application')

    // Can use back button
    cy.get('[data-testid="guidesBackButton"]').click()
    cy.get('[data-testid="guideDrawer"]').contains(':guide cypher')

    cy.get('[data-testid=drawerGuides]').click()
  })
})

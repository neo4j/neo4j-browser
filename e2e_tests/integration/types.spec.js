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

describe('Types in Browser', () => {
  it('loads', () => {
    cy
      .visit(Cypress.env('BROWSER_URL') || 'http://localhost:8080')
      .title()
      .should('include', 'Neo4j Browser')
  })
  it('can login', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')
    const password = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.connect(password)
  })
  it('presents the point type correctly', () => {
    cy.executeCommand(':clear')
    const query =
      "WITH point({{}crs: 'wgs-84', longitude: 12.78, latitude: 56.7}) as p1 RETURN p1"
    cy.executeCommand(query)
    cy.waitForCommandResult()

    cy
      .get('[data-test-id="frameContents"]', { timeout: 10000 })
      .then(contents => {
        // Check for point type support
        if (contents.find('.table-row').length > 0) {
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should('contain', 'point({srid:4326, x:12.78, y:56.7})')
          // Go to ascii view
          cy
            .get('[data-test-id="cypherFrameSidebarAscii"')
            .first()
            .click()

          // make sure we're there
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should('contain', '══════')
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should('contain', '│point({srid:4326, x:12.78, y:56.7})')
        } else {
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should('contain', 'ERROR')
        }
      })
  })
  it('presents temporal types correctly', () => {
    cy.executeCommand(':clear')
    const query =
      'RETURN datetime({{}year:2015, month:7, day:20, hour:15, minute:11, second:42, timezone:"Europe/Stockholm"}) AS t1'
    cy.executeCommand(query)
    cy.waitForCommandResult()

    cy
      .get('[data-test-id="frameContents"]', { timeout: 10000 })
      .then(contents => {
        // Check for datetime type support
        if (contents.find('.table-row').length > 0) {
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should(
              'contain',
              '"2015-07-20T15:11:42.000000000[Europe/Stockholm]"'
            )
          // Go to ascii view
          cy
            .get('[data-test-id="cypherFrameSidebarAscii"')
            .first()
            .click()

          // make sure we're there
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should('contain', '══════')
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should(
              'contain',
              '│"2015-07-20T15:11:42.000000000[Europe/Stockholm]"'
            )
        } else {
          cy
            .get('[data-test-id="frameContents"]', { timeout: 10000 })
            .first()
            .should('contain', 'ERROR')
        }
      })
  })
})

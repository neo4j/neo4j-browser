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
  it('can connect', () => {
    cy.executeCommand(':server disconnect')
    cy.executeCommand(':clear')
    cy.executeCommand(':server connect')
    const password = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.connect(password)
  })
  if (Cypress.config.serverVersion >= 3.4) {
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
            cy.resultContains('point({srid:4326, x:12.78, y:56.7})')

            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains('│point({srid:4326, x:12.78, y:56.7})')
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
    it('presents datetime type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN datetime({{}year:2015, month:7, day:20, hour:15, minute:11, second:42, timezone:"Europe/Stockholm"}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy
        .get('[data-test-id="frameContents"]', { timeout: 10000 })
        .then(contents => {
          // Check for type support
          if (contents.find('.table-row').length > 0) {
            cy.resultContains(
              '"2015-07-20T15:11:42.000000000[Europe/Stockholm]"'
            )
            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains(
              '│"2015-07-20T15:11:42.000000000[Europe/Stockholm]"'
            )
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
    it('presents local datetime type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN localdatetime({{}year:2015, month:7, day:20, hour:15, minute:11, second:42}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy
        .get('[data-test-id="frameContents"]', { timeout: 10000 })
        .then(contents => {
          // Check for type support
          if (contents.find('.table-row').length > 0) {
            cy.resultContains('"2015-07-20T15:11:42.000000000"')
            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains('│"2015-07-20T15:11:42.000000000"')
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
    it('presents date type correctly', () => {
      cy.executeCommand(':clear')
      const query = 'RETURN date({{}year:2015, month:7, day:20}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy
        .get('[data-test-id="frameContents"]', { timeout: 10000 })
        .then(contents => {
          // Check for type support
          if (contents.find('.table-row').length > 0) {
            cy.resultContains('"2015-07-20"')
            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains('│"2015-07-20"')
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
    it('presents duration type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN duration({{}months:14, days:3, seconds:14706, nanoseconds:0}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy
        .get('[data-test-id="frameContents"]', { timeout: 10000 })
        .then(contents => {
          // Check for type support
          if (contents.find('.table-row').length > 0) {
            cy.resultContains('"P14M3DT14706.000000000S"')
            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains('│"P14M3DT14706.000000000S"')
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
    it('presents time type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN time({{}hour:14, minute:3, second:4, timezone: "Europe/Stockholm"}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy
        .get('[data-test-id="frameContents"]', { timeout: 10000 })
        .then(contents => {
          // Check for type support
          if (contents.find('.table-row').length > 0) {
            cy.resultContains('"14:03:04.000000000+02:00"')
            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains('│"14:03:04.000000000+02:00"')
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
    it('presents localtime type correctly', () => {
      cy.executeCommand(':clear')
      const query = 'RETURN localtime({{}hour:14, minute:3, second:4}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy
        .get('[data-test-id="frameContents"]', { timeout: 10000 })
        .then(contents => {
          // Check for type support
          if (contents.find('.table-row').length > 0) {
            cy.resultContains('"14:03:04.000000000"')
            // Go to ascii view
            cy
              .get('[data-test-id="cypherFrameSidebarAscii"')
              .first()
              .click()
            cy.resultContains('│"14:03:04.000000000"')
          } else {
            cy.resultContains('ERROR')
          }
        })
    })
  }
})

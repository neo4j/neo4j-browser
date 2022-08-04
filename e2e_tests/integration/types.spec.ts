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

describe('Types in Browser', () => {
  before(function () {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  if (Cypress.config('serverVersion') >= 3.4) {
    it('presents large integers correctly', () => {
      cy.executeCommand(':clear')
      const query = 'RETURN 2467500000 AS bigNumber, {{}x: 9907199254740991}'
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy.resultContains('2467500000')
      cy.resultContains('9907199254740991')

      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│2467500000')
      cy.resultContains('9907199254740991')
    })
    it('presents the point type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        "WITH point({{}crs: 'wgs-84', longitude: 12.78, latitude: 56.7}) as p1 RETURN p1"
      cy.executeCommand(query)
      cy.waitForCommandResult()
      cy.resultContains('point({srid:4326, x:12.78, y:56.7})')

      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│point({srid:4326, x:12.78, y:56.7})')
    })
    it('presents datetime type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN datetime({{}year:2015, month:7, day:20, hour:15, minute:11, second:42, timezone:"Europe/Stockholm"}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()

      cy.resultContains('"2015-07-20T15:11:42[Europe/Stockholm]"')
      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│"2015-07-20T15:11:42[Europe/Stockholm]"')
    })
    it('presents local datetime type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN localdatetime({{}year:2015, month:7, day:20, hour:15, minute:11, second:42}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()

      cy.resultContains('"2015-07-20T15:11:42"')
      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│"2015-07-20T15:11:42"')
    })
    it('presents date type correctly', () => {
      cy.executeCommand(':clear')
      const query = 'RETURN date({{}year:2015, month:7, day:20}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()

      cy.resultContains('"2015-07-20"')
      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│"2015-07-20"')
    })
    it('presents duration type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN duration({{}months:14, days:3, seconds:14706, nanoseconds:0}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()

      cy.resultContains('P1Y2M3DT4H5M6S')
      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│P1Y2M3DT4H5M6S')
    })
    it('presents time type correctly', () => {
      cy.executeCommand(':clear')
      const query =
        'RETURN time({{}hour:14, minute:3, second:4, timezone: "Europe/Stockholm"}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()

      cy.resultContains('"14:03:04')
      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│"14:03:04')
    })
    it('presents localtime type correctly', () => {
      cy.executeCommand(':clear')
      const query = 'RETURN localtime({{}hour:14, minute:3, second:4}) AS t1'
      cy.executeCommand(query)
      cy.waitForCommandResult()

      cy.resultContains('"14:03:04"')
      // Go to ascii view
      cy.get('[data-testid="cypherFrameSidebarAscii"]').first().click()
      cy.resultContains('│"14:03:04"')
    })
    it('renders types in viz correctly', () => {
      cy.executeCommand('MATCH (t:Types) DELETE t;')
      cy.executeCommand(':clear')
      const query =
        "CREATE (p:Types {{}location: point({{}crs: 'wgs-84', x: 12.78, y: 56.7}), date: duration.between(datetime('2014-07-21T21:40:36.143+0200'), date('2015-06-24'))}) RETURN p"
      cy.executeCommand(query)
      // cy.waitForCommandResult()
      cy.get('circle.b-outline', { timeout: 10000 }).click()
      cy.get('[data-testid="vizInspector"]')
        .should('contain', 'P11M2DT2H19')
        .and('contain', 'srid:4326')
    })
    it('renders types in paths in viz correctly', () => {
      cy.executeCommand(':clear')
      const query = 'MATCH p=(:Types) RETURN p'
      cy.executeCommand(query)
      // cy.waitForCommandResult()
      cy.get('circle.b-outline', { timeout: 10000 }).click()
      cy.get('[data-testid="vizInspector"]')
        .should('contain', 'P11M2DT2H19')
        .and('contain', 'srid:4326')
        .and('contain', 'date')
        .and('contain', 'location')
        .and('contain', 'x:12.78')
        .and('contain', 'y:56.7')
    })
  }
})

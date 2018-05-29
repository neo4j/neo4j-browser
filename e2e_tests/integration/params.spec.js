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

describe(':param in Browser', () => {
  it('handles :param without web worker', () => {
    cy.executeCommand(':config userCypherThread: false').then(() => {
      cy.executeCommand(':clear')
      return runTests()
    })
  })
  it('handles :param WITH web worker', () => {
    cy.executeCommand(':config userCypherThread: true').then(() => {
      cy.executeCommand(':clear')
      return runTests()
    })
  })
})

function runTests () {
  let setParamQ
  let getParamQ
  // it('can connect', () => {
  const password = Cypress.env('browser-password') || 'newpassword'
  cy.connect('neo4j', password)
  // })
  // it(':param x => 1+1', () => {
  // Set param
  cy.executeCommand(':clear')
  setParamQ = ':param x => 1+1'
  cy.executeCommand(setParamQ)
  cy.resultContains('"x": 2')

  // return param
  cy.executeCommand(':clear')
  getParamQ = 'RETURN $x'
  cy.executeCommand(getParamQ)
  cy.waitForCommandResult()
  cy.resultContains('2')
  // })

  // it(':param x => 1.0', () => {
  // Set param
  cy.executeCommand(':clear')
  setParamQ = ':param x => 1.0'
  cy.executeCommand(setParamQ)
  cy.resultContains('"x": 1.0')

  // return param
  cy.executeCommand(':clear')
  getParamQ = 'RETURN $x'
  cy.executeCommand(getParamQ)
  cy.waitForCommandResult()
  cy.resultContains('1.0')
  // })

  // it('handles falsy param value e.g. :param x => 0', () => {
  // Set param
  cy.executeCommand(':clear')
  setParamQ = ':param x => 0'
  cy.executeCommand(setParamQ)
  cy.resultContains('"x": 0')

  // return param
  cy.executeCommand(':clear')
  getParamQ = 'RETURN $x'
  cy.executeCommand(getParamQ)
  cy.waitForCommandResult()
  cy.resultContains('0')
  // })

  if (Cypress.config.serverVersion >= 3.4) {
    // it(":param x => point({crs: 'wgs-84', latitude: 57.7346, longitude: 12.9082})", () => {
    cy.executeCommand(':clear')
    let query =
      ":param x => point({{}crs: 'wgs-84', latitude: 57.7346, longitude: 12.9082})"
    cy.executeCommand(query)

    cy
      .get('[data-test-id="rawParamData"]', { timeout: 20000 })
      .first()
      .should('contain', '"x": point({srid:4326, x:12.9082, y:57.7346})')
    getParamQ = 'RETURN $x'
    cy.executeCommand(getParamQ)
    cy.waitForCommandResult()
    cy.resultContains('point({srid:4326, x:12.9082, y:57.7346})')
  }
  // })
}

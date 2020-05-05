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

/* global Cypress, cy, before */

const commands = [
  ':style',
  ':server user add',
  ':server user list',
  ':server change-password',
  ':server status',
  ':server connect',
  ':help',
  ':play cypher',
  ':play https://guides.neo4j.com/reco',
  ':sysinfo',
  ':schema',
  ':history',
  ':config',
  ':params',
  ':param x => 1',
  ':param y: 2',
  ':queries',
  ':debug',
  ':get /',
  ':unknown',
  'RETURN 1',
  'ASDF'
]

describe('Commands', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
    cy.get('input[data-testid="boltaddress"]', { timeout: 40000 })
  })
  it('can run all simple commands not connected without blowing up', () => {
    commands.forEach(cmd => {
      cy.executeCommand(cmd)
      cy.wait(300)
      cy.executeCommand(':clear')
    })
  })
  it('can connect', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  it('can run all simple commands while connected without blowing up', () => {
    commands.forEach(cmd => {
      cy.executeCommand(cmd)
      cy.wait(300)
      cy.executeCommand(':clear')
    })
  })
})

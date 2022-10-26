/*
 * Copyright (c) Neo4j
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

import { isAura, isEnterpriseEdition } from '../support/utils'

describe('composite database', () => {
  before(function () {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
    cy.ensureConnection()
  })

  if (
    Cypress.config('serverVersion') >= 5.0 &&
    !isAura() &&
    isEnterpriseEdition()
  ) {
    it('can query composite db and show results', () => {
      cy.executeCommand(':clear')
      const query = `create database compdb1;create database compdb2;use compdb1 create (:Poke {{}name: "Treecko"{}})-[:EVOLVES_INTO]->(:Poke {{}name: "Grovyle"{}});CREATE COMPOSITE DATABASE both;CREATE ALIAS both.cd1 FOR DATABASE compdb1;CREATE ALIAS both.cd2 FOR DATABASE compdb2;`

      cy.executeCommand(query)
      cy.get('[data-testid="multi-statement-list-icon"]')
        .last()
        .invoke('attr', 'title')
        .should('equal', 'Status: success')

      cy.executeCommand('SHOW DATABASES')
      cy.contains('both')
      cy.resultContains('"both"')

      cy.executeCommand(':use both')
      cy.executeCommand(':clear')
      cy.executeCommand(
        "CALL {{} USE both.cd1 MATCH path=(p:Poke)-[:EVOLVES_INTO]->(m) where p.name = 'Treecko' return path as p limit 10 {}} return p;"
      )
      cy.waitForCommandResult()

      cy.get('[data-testid="vizInspector"]', { timeout: 5000 }).contains(
        'EVOLVES_INTO'
      )

      cy.get('circle.b-outline', { timeout: 10000 }).eq(0).should('be.visible')

      // cleanup
      cy.executeCommand(`
    drop alias both.cd1 for database;
    drop alias both.cd2 for database;
    drop database compdb1;
    drop database compdb2;
    drop database both;
     `)

      cy.executeCommand(':use neo4j')
      cy.executeCommand(':clear')
    })
  }
})

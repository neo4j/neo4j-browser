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

describe(':auto prefix in browser', () => {
  before(() => {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
    cy.ensureConnection()
  })
  beforeEach(() => {
    cy.executeCommand(':clear')
  })

  if (Cypress.config('serverVersion') < 5) {
    it('shows help link when running period commit without :auto', () => {
      cy.executeCommand('USING PERIODIC COMMIT RETURN "Verdanturf"')
      cy.getFrames().contains('ERROR')
      cy.getFrames().contains(':auto')
    })

    it('adding :auto enables running periodic commit', () => {
      cy.executeCommand(':auto USING PERIODIC COMMIT RETURN "Laverre";')
      // the only valid PERIODIC COMMIT queries require csv files on
      // the server, so as a shortcut we're just looking for a new error message
      cy.getFrames().contains('ERROR')
      cy.getFrames().contains(/LOAD/i)
    })
  }

  if (Cypress.config('serverVersion') >= 4.4) {
    it('shows help link when running CALL IN TRANSACTIONS without :auto', () => {
      cy.executeCommand(
        `MATCH (n) WITH n CALL {{} CALL db.ping() YIELD success {}} IN TRANSACTIONS`
      )
      cy.getFrames().contains('ERROR')
      cy.getFrames().contains(':auto')
    })

    it('adding :auto enables running CALL IN TRANSACTIONS', () => {
      cy.executeCommand(
        `:auto MATCH (n) WITH n CALL {{} CALL db.ping() YIELD success {}} IN TRANSACTIONS`
      )
      cy.getFrames().should('not.contain', 'ERROR')
      cy.getFrames().contains('(no changes, no records)')
    })
  }

  it('can use :auto command in multi-statements', () => {
    cy.executeCommand('create ();')
    cy.executeCommand(':clear')
    const query = `:auto CREATE (t:MultiStmtTest {{}name: "Pacifidlog"}) RETURN t;:auto CREATE (t:MultiStmtTest {{}name: "Wyndon"}) RETURN t;`
    cy.executeCommand(query)
    cy.get('[data-testid="frame"]', { timeout: 10000 }).should('have.length', 1)
    const frame = cy.get('[data-testid="frame"]', { timeout: 10000 }).first()
    frame.find('[data-testid="multi-statement-list"]').should('have.length', 1)
    frame
      .get('[data-testid="multi-statement-list-title"]')
      .should('have.length', 2)
    frame.get('[data-testid="multi-statement-list-title"]').eq(0).click()
    frame
      .get('[data-testid="multi-statement-list-content"]', { timeout: 10000 })
      .contains('SUCCESS')
    frame.get('[data-testid="multi-statement-list-title"]').eq(1).click()
    frame
      .get('[data-testid="multi-statement-list-content"]', { timeout: 10000 })
      .contains('SUCCESS')
    cy.executeCommand('match (n: MultiStmtTest) return n.name')
    cy.get('[role="cell"]').contains('Pacifidlog')
    cy.get('[role="cell"]').contains('Wyndon')
    cy.executeCommand('match (n: MultiStmtTest) delete n')
  })
})

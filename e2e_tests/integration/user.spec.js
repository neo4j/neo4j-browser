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

import { isEnterpriseEdition } from '../support/utils'

/* global Cypress, cy, test, expect, before */

describe('User: ', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
    cy.get('input[data-testid="boltaddress"]', { timeout: 40000 })
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  it('Doesnt throw when listing users', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':server user list')
    cy.get('[data-testid="frame"]', { timeout: 10000 }).should(
      'contain',
      isEnterpriseEdition() ? 'Username' : 'Unable to display'
    )
  })
  // Only on enterprise
  if (isEnterpriseEdition()) {
    it('Add User', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(':server user add')
      cy.addUser('Bob', 'hi', 'editor', false)
      cy.executeCommand(':clear')
      cy.executeCommand(':server user list')
      cy.get('.user-info > .username').should('have.length', 2)
      cy.get('.user-info > .username').contains('Bob')
    })

    it('Add User with forced pw change', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(':server user add')
      cy.addUser('Rob', 'hi', 'editor', true)
      cy.executeCommand(':clear')
      cy.executeCommand(':server user list')
      cy.get('.user-info > .username').should('have.length', 3)
      cy.get('.user-info > .username').contains('Rob')
      cy.dropUser('Bob')
      cy.dropUser('Rob')
    })
  }
})

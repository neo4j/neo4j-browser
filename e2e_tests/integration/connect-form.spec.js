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

import { isAura, isEnterpriseEdition, stripScheme } from '../support/utils'

/* global Cypress, cy, test, expect, before */

const getBoltUrlField = () => cy.get('input[data-testid="boltaddress"]')
const getBoltSchemeSelect = () =>
  cy.get('select[data-testid="bolt-scheme-select"]')
const getFirstFrameStatusbar = () =>
  cy.get('[data-testid="frameStatusbar"]').first()
const getFirstFrameCommand = () =>
  cy.get('[data-testid="frameCommand"]').first()

describe('Connect form', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })

  it('extracts the scheme from the bolt url entered', () => {
    const scheme = 'bolt://'
    const host = 'localhost:1212'
    getBoltUrlField()
      .clear()
      .type(scheme + host)

    getBoltUrlField().should('have.value', host)
    getBoltSchemeSelect().should('have.value', scheme)
  })
  it('extracts the scheme from the bolt url entered with encryption flag', () => {
    const scheme = 'neo4j+s://'
    const nonSecureScheme = 'neo4j://'
    const host = 'localhost:7687'
    getBoltUrlField()
      .clear()
      .type(scheme + host)

    getBoltUrlField().should('have.value', host)
    getBoltSchemeSelect().should('have.value', nonSecureScheme)
  })
  it('aliases bolt+routing:// to neo4j://', () => {
    getBoltSchemeSelect().select('bolt://')
    const scheme = 'bolt+routing://'
    const aliasScheme = 'neo4j://'
    const host = 'localhost:7687'
    getBoltUrlField()
      .clear()
      .type(scheme + host)

    getBoltUrlField().should('have.value', host)
    getBoltSchemeSelect().should('have.value', aliasScheme)
  })

  it('can connect with bolt:// protocol', () => {
    cy.executeCommand(':clear')
    const boltUrl = 'bolt://' + stripScheme(Cypress.config('boltUrl'))
    cy.connect('neo4j', Cypress.config('password'), boltUrl)
    cy.executeCommand(':server disconnect')
  })
  // Check auto switching protocols for non supporting neo4j://
  if (Cypress.config('serverVersion') < 4.0) {
    it('browser auto-connects with bolt:// protocol after neo4j:// failed with routing issues', () => {
      cy.executeCommand(':clear')
      const boltUrl = 'neo4j://' + stripScheme(Cypress.config('boltUrl'))
      cy.connect('neo4j', Cypress.config('password'), boltUrl, false)
      getFirstFrameStatusbar().should(
        'contain',
        'Automatic retry using the "bolt://"'
      )
      cy.wait(7000) // auto retry is in 5 secs
      getFirstFrameCommand().should('contain', ':play start')
      cy.executeCommand(':server disconnect')
      cy.executeCommand(':clear')
    })
  }
  if (Cypress.config('serverVersion') >= 4.0) {
    it('can connect with the neo4j:// scheme', () => {
      cy.executeCommand(':clear')
      const boltUrl = 'neo4j://' + stripScheme(Cypress.config('boltUrl'))
      cy.connect('neo4j', Cypress.config('password'), boltUrl)
      cy.executeCommand(':server disconnect')
    })
  }
})

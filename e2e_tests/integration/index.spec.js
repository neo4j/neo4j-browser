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

const Carousel = '[data-test-id="carousel"]'
const SubmitQueryButton = '[data-test-id="submitQuery"]'
const Editor = '.ReactCodeMirror textarea'

describe('Neo4j Browser', () => {
  it('loads', () => {
    cy
      .visit(Cypress.env('BROWSER_URL') || 'http://localhost:8080')
      .title()
      .should('include', 'Neo4j Browser')
  })
  it('sets new login credentials', () => {
    cy.title().should('include', 'Neo4j Browser')

    cy
      .get('input[data-test-id="boltaddress"]')
      .clear()
      .type('bolt://localhost:7687')

    cy.get('input[data-test-id="username"]').should('have.value', 'neo4j')
    cy.get('input[data-test-id="password"]').should('have.value', '')

    cy.get('input[data-test-id="password"]').type('neo4j')

    cy.get('input[data-test-id="username"]').should('have.value', 'neo4j')

    cy.get('button[data-test-id="connect"]').click()

    // update password
    cy.get('input[data-test-id="newPassword"]')
    cy.get('input[data-test-id="newPassword"]').should('have.value', '')
    cy
      .get('input[data-test-id="newPasswordConfirmation"]')
      .should('have.value', '')

    const newPassword = Cypress.env('BROWSER_NEW_PASSWORD') || 'newpassword'
    cy.get('input[data-test-id="newPassword"]').type(newPassword)
    cy.get('input[data-test-id="newPasswordConfirmation"]').type(newPassword)
    cy.get('button[data-test-id="changePassword"]').click()

    cy.get('input[data-test-id="changePassword"]').should('not.be.visible')

    cy.get('input[data-test-id="connect"]').should('not.be.visible')
    cy.wait(500)
    cy
      .get('[data-test-id="frameCommand"]')
      .first()
      .should('contain', ':play start')
  })
  it('can run cypher statement', () => {
    const cypher = 'return 1'
    cy.get(Editor).type(cypher, { force: true })
    cy.get(Editor).should('have.value', cypher)
    cy.get(SubmitQueryButton).click()
    cy
      .get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', cypher)
    cy
      .get('[data-test-id="frameLoading"]', { timeout: 10000 })
      .should('not.be.visible')
  })
  it('can exec cypher from `:play movies`', () => {
    const cypher = ':play movies'
    cy.get('[data-test-id="clearEditorContent"]').click()

    cy.get(Editor).type(cypher, { force: true })
    cy.get(Editor).should('have.value', cypher)

    cy.get(SubmitQueryButton).click()
    cy
      .get('[data-test-id="frameCommand"]')
      .first()
      .should('contain', cypher)

    cy
      .get(Carousel)
      .find('[data-test-id="nextSlide"]')
      .click()
    cy
      .get(Carousel)
      .find('[data-test-id="nextSlide"]')
      .click()
    cy
      .get(Carousel)
      .find('[data-test-id="previousSlide"]')
      .click()
    cy
      .get(Carousel)
      .find('.code')
      .click()
    cy.get(SubmitQueryButton).click()
    cy
      .get('[data-test-id="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', 'Emil Eifrem')
  })
  it('can display meta items from side drawer', () => {
    cy.get('[data-test-id="drawerDB"]').click()
    cy
      .get('[data-test-id="sidebarMetaItem"]', { timeout: 30000 })
      .should('have.length', 18)
  })
})

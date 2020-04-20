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

import { isAura, isEnterpriseEdition } from '../support/utils'

/* global Cypress, cy, test, expect, before */

const Editor = '.ReactCodeMirror textarea'
const Carousel = '[data-testid="carousel"]'
const SubmitQueryButton = '[data-testid="submitQuery"]'
const ClearEditorButton = '[data-testid="clearEditorContent"]'

describe('Neo4j Browser', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })
  it('sets new login credentials', () => {
    const newPassword = Cypress.config('password')
    cy.setInitialPassword(newPassword)
    cy.disconnect()
  })
  it('populates the editor when clicking the connect banner', () => {
    cy.get('[data-testid="disconnectedBannerCode"]').click()
    cy.get('[data-testid="frameCommand"]')
      .first()
      .should('contain', ':server connect')
    cy.get(ClearEditorButton).click()
  })
  it('can connect', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })

  it('can empty the db', () => {
    cy.executeCommand(':clear')
    const query = 'MATCH (n) DETACH DELETE n'
    cy.executeCommand(query)
    cy.waitForCommandResult()
    cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy.get('[data-testid="frameStatusbar"]', { timeout: 100000 })
      .first()
      .contains(/completed/i)
  })
  it('can run cypher statement', () => {
    cy.executeCommand(':clear')
    const query = 'RETURN 1'
    cy.executeCommand(query)
    cy.waitForCommandResult()
    cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy.get('[data-testid="frameStatusbar"]', { timeout: 10000 })
      .first()
      .should('contain', 'Started streaming')
  })
  it('shows error frame for unknown command', () => {
    cy.executeCommand(':clear')
    const query = ':unknown'
    cy.executeCommand(query)
    cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', query)
    cy.get('[data-testid="frame"]', { timeout: 10000 })
      .first()
      .should('contain', 'Error')
  })
  it('can exec cypher from `:play movies`', () => {
    cy.executeCommand(':clear')
    const query = ':play movies'
    cy.executeCommand(query)
    cy.get('[data-testid="frameCommand"]')
      .first()
      .should('contain', query)
    cy.get(Carousel)
      .find('[data-testid="nextSlide"]')
      .click()
    cy.get(Carousel)
      .find('[data-testid="nextSlide"]')
      .click()
    cy.get(Carousel)
      .find('[data-testid="previousSlide"]')
      .click()
    cy.get(Carousel)
      .find('.code')
      .click()
    cy.get(SubmitQueryButton).click()
    cy.waitForCommandResult()
    cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      .first()
      .should('contain', 'Emil Eifrem')
  })
  it('can display meta items from side drawer', () => {
    cy.executeCommand(':clear')
    cy.get('[data-testid="drawerDBMS"]').click()
    cy.get('[data-testid="sidebarMetaItem"]', { timeout: 30000 }).should(p => {
      expect(p).to.have.length.above(17)
    })
    cy.get('[data-testid="drawerDBMS"]').click()
  })
  it('displays user info in sidebar (when connected)', () => {
    cy.executeCommand(':clear')
    cy.get('[data-testid="drawerDBMS"]').click()
    cy.get('[data-testid="user-details-username"]').should('contain', 'neo4j')
    console.log('isEnterpriseEdition(): ', isEnterpriseEdition())
    cy.get('[data-testid="user-details-roles"]').should(
      'contain',
      isAura()
        ? 'PUBLIC'
        : isEnterpriseEdition() || Cypress.config('serverVersion') < 4.0
        ? 'admin'
        : '-'
    )
    cy.executeCommand(':clear')
    cy.executeCommand(':server disconnect')
    cy.get('[data-testid="user-details-username"]').should('have.length', 0)
    cy.get('[data-testid="user-details-roles"]').should('have.length', 0)
    cy.connect('neo4j', Cypress.config('password'))
    cy.executeCommand(':clear')
    cy.get('[data-testid="user-details-username"]').should('contain', 'neo4j')
    cy.get('[data-testid="user-details-roles"]').should(
      'contain',
      isAura()
        ? 'PUBLIC'
        : isEnterpriseEdition() || Cypress.config('serverVersion') < 4.0
        ? 'admin'
        : '-'
    )
    cy.get('[data-testid="drawerDBMS"]').click()
  })

  // Browser sync is disabled on Aura
  if (!isAura()) {
    it('will clear local storage when clicking "Clear local data"', () => {
      const scriptName = 'foo'
      cy.get(Editor).type(`//${scriptName}`, { force: true })
      cy.get('[data-testid="editorFavorite"]').click()

      cy.get('[data-testid="drawerFavorites"]').click()
      cy.get('.saved-scripts-list-item')
        .first()
        .should('be', scriptName)

      cy.get('[data-testid="drawerSync"]').click()
      cy.get('[data-testid="clearLocalData"]').click()
      cy.wait(500)

      // confirm clear
      cy.get('[data-testid="clearLocalData"]').click()

      cy.get('[data-testid="drawerFavorites"]').click()
      cy.get('.saved-scripts-list-item').should('have.length', 0)
      cy.get('[data-testid="drawerFavorites"]').click()

      // once data is cleared the user is logged out and the connect form is displayed
      cy.get('input[data-testid="boltaddress"]')
    })
  }
  it('displays no user info in sidebar (when not connected)', () => {
    cy.executeCommand(':server disconnect')
    cy.executeCommand(':clear')
    cy.get('[data-testid="drawerDBMS"]').click()
    cy.get('[data-testid="user-details-username"]').should('have.length', 0)
    cy.get('[data-testid="user-details-roles"]').should('have.length', 0)
    cy.get('[data-testid="drawerDBMS"]').click()
  })
})

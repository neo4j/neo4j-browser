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

describe('Saved Scripts', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    //cy.wait(3000)
    cy.connect('neo4j', Cypress.config('password'))
  })

  it('can save a result as favorite', () => {
    cy.executeCommand('RETURN 1')
    cy.get('[data-testid=frame-Favorite]').click()
    cy.get('[data-testid=scriptName]')
      .clear()
      .type('script name')
    cy.get('[data-testid=saveScript]').click()

    // saved in the list and can populate editor
    cy.get('[data-testid="scriptTitle-script name"]').click()
    cy.get('[data-testid="currentlyEditing"]').contains('script name')
    // Editing script updates name and content
    cy.get('[data-testid="activeEditor"] textarea')
      .type(
        Cypress.platform === 'darwin'
          ? '{cmd}a {backspace}'
          : '{ctrl}a {backspace}'
      )
      .type('// Guide{shift}{enter}:play movies', { force: true })
    cy.get('[title="Update favorite"]').click()

    cy.get('[data-testid="scriptTitle-Guide"]').should('exist')
    cy.get('[data-testid="currentlyEditing"]').contains('Guide')
    cy.get('[data-testid=savedScriptsButton-Run]').click()
    cy.getFrames().contains('Movie Graph')
  })

  it('it can drag and drop a favorite in a  folder', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(':help cypher')
    cy.get('[data-testid=frame-Favorite]').click()
    cy.get('[data-testid=scriptName]')
      .invoke('val')
      .should('equal', ':help cypher')

    cy.get('[data-testid=saveScript]').click()

    cy.get('[data-testid="savedScriptsButton-New folder"]').click()
    cy.get('[data-testid="savedScriptsButton-Edit"]')
      .eq(1)
      .click({ force: true })
    cy.get('[data-testid="editSavedScriptFolderName"]')
      .clear()
      .type('fldr{enter}')

    cy.get('[data-testid="scriptTitle-:help cypher"]').trigger('dragstart')

    cy.get('[data-testid=expandFolder-fldr]').trigger('drop', {
      // this is to make react-dnd happy
      dataTransfer: { files: [] }
    })

    cy.wait(500)
    cy.get('[data-testid=expandFolder-fldr]').trigger('dragend')

    // moved script should be in the folder
    cy.get('[data-testid="scriptTitle-:help cypher"]').should('not.exist')
    cy.get('[data-testid=expandFolder-fldr]').click()
    cy.get('[data-testid="scriptTitle-:help cypher"]').should('exist')
  })
})

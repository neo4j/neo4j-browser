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
const fullscreenButton = '[data-testid="editor-fullscreen"]'
const cardSizeButton = '[data-testid="editor-cardSize"]'

describe('editor', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
    cy.get('input[data-testid="boltaddress"]', { timeout: 40000 })
  })

  it('full screen is always in multiline', () => {
    cy.get('.CodeMirror-linenumber').should('contain', '$')
    // Go to full screen
    cy.get('body').type('{cmd}{ctrl}{alt}f')
    cy.get('.CodeMirror-linenumber').should('contain', '1')

    // Enter enters more lines
    cy.get('.CodeMirror-scroll').type('{enter}{enter}{enter}')
    cy.get('.CodeMirror-linenumber').should('contain', '4')

    // Empty query is not submitted
    cy.get('.CodeMirror-scroll').type('{control}{enter}')
    cy.get('.CodeMirror-linenumber').should('contain', '4')

    // Keep being in multiline even when only one row
    cy.get('.CodeMirror-scroll').type(
      '{backspace}{backspace}{backspace}{backspace}'
    )
    cy.get('.CodeMirror-linenumber').should('contain', '1')

    // Can still run query, then editor collapses again
    cy.get('.CodeMirror-scroll').type(':history{control}{enter}')
    cy.get('.CodeMirror-linenumber').should('contain', '$')
  })

  it('supports changing ui size from controls', () => {
    cy.get('.CodeMirror-linenumber').should('contain', '$')

    // Toggle card view and back
    cy.get(cardSizeButton).click()
    cy.get('.CodeMirror-linenumber').should('contain', '1')
    cy.get(cardSizeButton).click()
    cy.get('.CodeMirror-linenumber').should('contain', '$')

    // toggle full screen and nback
    cy.get(fullscreenButton).click()
    cy.get('.CodeMirror-linenumber').should('contain', '1')
    cy.get(fullscreenButton).click()
    cy.get('.CodeMirror-linenumber').should('contain', '$')

    // discard resets size and clears editor
    cy.get(cardSizeButton).click()
    cy.get('.CodeMirror-linenumber').should('contain', '1')
    cy.get('body').type('/test')
    cy.get('.CodeMirror-line').contains('test')
    cy.get(
      '[data-testid="activeEditor"] [data-testid="editor-discard"]'
    ).click()
    cy.get('.CodeMirror-linenumber').should('contain', '$')
    cy.get('.CodeMirror-line').should('not.contain.text', 'test')
  })
})

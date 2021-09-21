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

const EditorArea = '[data-testid="activeEditor"]'
const { viewportWidth, viewportHeight } = Cypress.config()
const MainEditorMaxHeight = 286
const MainEditorWidth = viewportWidth - 80
const FrameEditorMaxHeight = 276
const FrameEditorWidth = viewportWidth - 184
const FrameEditorFullscreenWidth = viewportWidth - 94
const FrameMaxHeight = 580
const FrameFullscreenHeight = viewportHeight - 3

describe('Neo4j Browser', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
      .title()
      .should('include', 'Neo4j Browser')
    cy.wait(3000)
  })

  it('can fullscreen main editor with shortcut', () => {
    const { viewportWidth, viewportHeight } = Cypress.config()

    cy.get(EditorArea).type('{shift}\n'.repeat(20))
    cy.get(EditorArea)
      .invoke('height')
      .should('equal', MainEditorMaxHeight)

    cy.get(EditorArea)
      .invoke('width')
      .should('equal', MainEditorWidth)

    // Go to fullscreen
    cy.get(EditorArea).type('{esc}')

    cy.get(EditorArea)
      .invoke('height')
      .should('equal', viewportHeight)

    cy.get(EditorArea)
      .invoke('width')
      .should('equal', viewportWidth) // editor is now full width

    // we can leave fullscreen
    cy.get(EditorArea).type('{esc}')
    cy.get(EditorArea)
      .invoke('height')
      .should('equal', MainEditorMaxHeight)

    cy.get(EditorArea)
      .invoke('width')
      .should('equal', MainEditorWidth)
  })

  it('can fullscreen main editor by clicking fullscreen icon', () => {
    const { viewportWidth, viewportHeight } = Cypress.config()

    cy.get(EditorArea).type('{shift}\n'.repeat(20))
    cy.get(EditorArea)
      .invoke('height')
      .should('equal', MainEditorMaxHeight)

    cy.get(EditorArea)
      .invoke('width')
      .should('equal', MainEditorWidth)

    cy.get('[data-testid="editor-fullscreen"]').click()

    cy.get(EditorArea)
      .invoke('height')
      .should('equal', viewportHeight)

    cy.get(EditorArea)
      .invoke('width')
      .should('equal', viewportWidth)

    cy.get('[data-testid="editor-fullscreen"]').click()
    cy.get(EditorArea)
      .invoke('height')
      .should('equal', MainEditorMaxHeight)

    cy.get(EditorArea)
      .invoke('width')
      .should('equal', MainEditorWidth)
  })

  it('re-usable fram can also use fullscreen', () => {
    cy.executeCommand(':clear')
    cy.executeCommand('return 1')
    cy.get('[data-testid="frameCommand"]')
      .contains('return 1')
      .click()

    cy.get('[id^=monaco-]')
      .eq(1)
      .type('{shift}\n'.repeat(20))

    cy.get('[id^=monaco-]')
      .eq(1)
      .invoke('height')
      .should('equal', FrameEditorMaxHeight)

    cy.get('[id^=monaco-]')
      .eq(1)
      .closest('article')
      .invoke('height')
      .should('equal', FrameMaxHeight)

    cy.get('[id^=monaco-]')
      .eq(1)
      .invoke('width')
      .should('equal', FrameEditorWidth) // normal reusable-editor width

    // goto fullscreen
    cy.get('[id^=monaco-]')
      .eq(1)
      .type('{esc}')

    cy.get('[id^=monaco-]')
      .eq(1)
      .invoke('height')
      .should('equal', FrameEditorMaxHeight) // reusable keeps the same height on fullscren but content take up whole screen

    cy.get('[id^=monaco-]')
      .eq(1)
      .closest('article')
      .invoke('height')
      .should('equal', FrameFullscreenHeight)

    cy.get('[id^=monaco-]')
      .eq(1)
      .invoke('width')
      .should('equal', FrameEditorFullscreenWidth)

    cy.get('[title="Close fullscreen"]').click()

    cy.get('[id^=monaco-]')
      .eq(1)
      .invoke('height')
      .should('equal', FrameEditorMaxHeight)

    cy.get('[id^=monaco-]')
      .eq(1)
      .invoke('width')
      .should('equal', FrameEditorWidth)

    // frame height back to normal as well
    cy.get('[id^=monaco-]')
      .eq(1)
      .closest('article')
      .invoke('height')
      .should('equal', FrameMaxHeight)
  })
})

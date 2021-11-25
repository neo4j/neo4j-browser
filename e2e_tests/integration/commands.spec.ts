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

const commandDelays: Record<string, number> = {
  ':param x => 1': 3000
}

const getCommandDelay = (command: string) => commandDelays[command] || 300

describe('Commands', () => {
  before(function() {
    cy.visit(Cypress.config('url'))
    cy.get('input[data-testid="boltaddress"]', { timeout: 40000 })
  })
  it('can type in editor and run commands manually', () => {
    cy.executeCommand(':help help')
    cy.get('[data-testid="frameCommand"]').contains(':help help')
    // lose focus
    cy.get('[data-testid=navigationFavorites]').click()
    cy.get('[data-testid=navigationFavorites]').click()
    cy.get('#monaco-main-editor > .monaco-editor').should(
      'not.have.class',
      'focused'
    )

    // we now have 2 cards, and some hidden padding
    cy.get('[data-testid="stream"]')
      .children()
      .should('have.length', 3)

    // focus editor
    cy.get('body').type('/')
    cy.get('#monaco-main-editor > .monaco-editor')
      .should('have.class', 'focused')
      .type(':clear{shift}{enter}')

    // we see line number in multiline view
    cy.get('.line-numbers').should('contain', '1')
    // we can run command with ctrl enter
    cy.get('[data-testid="activeEditor"] textarea').type('{ctrl}{enter}')
    // editor is now cleared
    cy.get('[data-testid="stream"]')
      .children()
      .should('have.length', 1)
  })
  it('can run all simple commands not connected without blowing up', () => {
    commands.forEach(cmd => {
      cy.executeCommand(cmd)
      cy.wait(getCommandDelay(cmd))
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
      cy.wait(getCommandDelay(cmd))
      cy.executeCommand(':clear')
    })
  })

  it('can re-run all simple commands while connected without blowing up', () => {
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
    cy.executeCommand('return 1')
    cy.get('[data-testid="frameCommand"]')
      .contains('return 1')
      .click()
    commands.forEach(cmd => {
      cy.typeInFrame(`${cmd}{enter}`)
      cy.wait(getCommandDelay(cmd))
    })
  })

  it('can ctrl+click to re-populate the main editor', () => {
    cy.executeCommand(':clear')
    cy.executeCommand('return 1')
    cy.get('[data-testid="frameCommand"]')
      .contains('return 1')
      .click()

    cy.typeInFrame('Vermilion')

    // click outside frame
    cy.get('#monaco-main-editor').click()

    cy.get('body').type('{ctrl}', { force: true, release: false })
    cy.get('[data-testid="frameCommand"]').click()
    cy.get('body').type('{ctrl}') // release mod

    cy.get('#monaco-main-editor').contains('Vermilion')
  })
})

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

import { selectAllAndDelete } from '../support/commands'

/* global Cypress, cy, before */

describe('Cypher Editor', () => {
  before(function () {
    cy.visit(Cypress.config('url'))
    cy.get('input[data-testid="boltaddress"]', { timeout: 40000 })
    cy.ensureConnection()
  })

  it('can autocomplete', () => {
    cy.executeCommand('create (:AutocompeleteLabel)')
    cy.getEditor().type(':')
    cy.getEditor().contains(':play')
    cy.getEditor().contains(':config')
    cy.getEditor().contains(':guide')

    cy.getEditor().type('{backspace}call dbms.listC')
    cy.getEditor().contains('listConfig')

    // It can take a little while for the label meta-data to update in the background
    cy.getEditor().type(selectAllAndDelete)
    cy.executeCommand('return extraTimeForMetadataupdate')
    cy.resultContains('extraTimeForMetadataupdate')
    cy.wait(5000)

    cy.getEditor().type(selectAllAndDelete)
    cy.getEditor().type('MATCH (:')
    cy.getEditor().contains(':AutocompeleteLabel')

    cy.getEditor().type(selectAllAndDelete)
    // cleanup
    cy.executeCommand('match (n:AutocompeleteLabel) delete n;')
  })
})

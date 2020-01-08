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

import { getDesktopContext } from '../support/utils'
let appContextListener

// This file only esists to be able to test the auto connect using
// the host field.
// We can't load two times in the same file

describe('Neo4j Desktop environment using url field', () => {
  before(() => {
    cy.visit(Cypress.config('url'), {
      onBeforeLoad: win => {
        win.neo4jDesktopApi = {
          getContext: () =>
            Promise.resolve(getDesktopContext(Cypress.config, 'url')),
          onContextUpdate: fn => (appContextListener = fn.bind(fn))
        }
      }
    })
  })
  it('can auto connect using url field', () => {
    const frames = cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
    frames.should('have.length', 2)

    // Auto connected = :play start
    frames.first().should('contain', ':play start')
    cy.wait(1000)
  })
  it('switches connection when that event is triggered using url field', () => {
    cy.executeCommand(':clear')
    cy.wait(1000).then(() => {
      appContextListener(
        { type: 'GRAPH_ACTIVE', id: 'test' },
        getDesktopContext(Cypress.config, 'url')
      )
    })

    const frames = cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
    frames.should('have.length', 1)

    frames.first().should('contain', ':server switch success')

    cy.get('[data-testid="frame"]', { timeout: 10000 })
      .first()
      .should('contain', 'Connection updated')
  })
})

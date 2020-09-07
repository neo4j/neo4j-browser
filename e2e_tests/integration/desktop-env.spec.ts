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
import { isAura, getDesktopContext } from '../support/utils'

let appContextListener

describe('Neo4j Desktop environment', () => {
  before(() => {
    cy.visit(Cypress.config('url'), {
      onBeforeLoad: win => {
        win.neo4jDesktopApi = {
          getContext: () =>
            Promise.resolve(getDesktopContext(Cypress.config, 'host')),
          onContextUpdate: fn => (appContextListener = fn.bind(fn))
        }
      }
    })
  })
  // No need to test these in Aura
  if (!isAura()) {
    it('can auto connect using host + post fields', () => {
      const frames = cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      frames.should('have.length', 2)

      // Auto connected = :play start
      frames.first().should('contain', ':play start')
      cy.wait(1000)
    })
    it('switches connection when that event is triggered using host + port fields', () => {
      cy.executeCommand(':clear')
      cy.wait(1000).then(() => {
        appContextListener(
          { type: 'GRAPH_ACTIVE', id: 'test' },
          getDesktopContext(Cypress.config, 'host')
        )
      })

      const frames = cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      frames.should('have.length', 1)

      frames.first().should('contain', ':server switch success')

      cy.get('[data-testid="frame"]', { timeout: 10000 })
        .first()
        .should('contain', 'Connection updated')
    })

    it('displays disconnected banner and connection failed frame when initial state is INACTIVE', () => {
      cy.visit(Cypress.config('url'), {
        onBeforeLoad: win => {
          win.neo4jDesktopApi = {
            getContext: () =>
              Promise.resolve(
                getDesktopContext(Cypress.config, 'host', 'INACTIVE')
              )
          }
        }
      })

      const frames = cy.get('[data-testid="frameCommand"]', { timeout: 10000 })
      frames.should('have.length', 1)

      frames.first().should('contain', ':server switch fail')

      cy.get('[data-testid="disconnectedBanner"]', { timeout: 10000 })
        .first()
        .should('contain', 'Database access not available.')
    })
  }
})

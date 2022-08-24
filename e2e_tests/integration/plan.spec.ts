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

import { isEnterpriseEdition } from '../support/utils'

/* global Cypress, cy, before, after */

describe('Plan output', () => {
  before(function () {
    cy.visit(Cypress.config('url')).title().should('include', 'Neo4j Browser')
    cy.wait(3000)
    const password = Cypress.config('password')
    cy.connect('neo4j', password)
  })
  it('displays the expanded details by default and displays/hides details when clicking the plan expand/collapse buttons respectively', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(
      'EXPLAIN MATCH (n:Person) WHERE n.age > 18 RETURN n.name ORDER BY n.age'
    )

    // initially should be expanded
    const el1 = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
    el1.find('.detail').should('exist')

    // collapse
    cy.get('[data-testid="planCollapseButton"]', { timeout: 10000 }).click()
    const el2 = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
    el2.find('.detail').should('not.exist')

    // expand
    cy.get('[data-testid="planExpandButton"]', { timeout: 10000 }).click()
    const el3 = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
    el3.find('.detail').should('exist')
  })
  if (Cypress.config('serverVersion') >= 3.5) {
    it('print Order in PROFILE', () => {
      cy.executeCommand(':clear')
      if (Cypress.config('serverVersion') < 4.0) {
        cy.executeCommand('CREATE INDEX ON :Person(age)')
      } else {
        cy.executeCommand('CREATE INDEX FOR (p:Person) ON (p.age)')
      }
      cy.executeCommand(
        'EXPLAIN MATCH (n:Person) WHERE n.age > 18 RETURN n.name ORDER BY n.age'
      )
      cy.get('[data-testid="planExpandButton"]', { timeout: 10000 }).click()
      const el = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
      el.should('contain', 'Ordered by n.age ASC')
    })
  }
  if (Cypress.config('serverVersion') >= 4.1 && isEnterpriseEdition()) {
    it('print total memory in PROFILE', () => {
      cy.executeCommand(':clear')
      cy.executeCommand('CREATE INDEX FOR (p:Person) ON (p.age)')
      cy.executeCommand(
        'PROFILE MATCH (n:Person) WHERE n.age > 18 RETURN n.name ORDER BY n.age'
      )
      cy.get('[data-testid="planExpandButton"]', { timeout: 10000 }).click()
      cy.get('.global-memory').should('contain', 'total memory (bytes)')
      cy.get('.operator-memory').should('contain', 'memory (bytes)')
    })
  }
  if (
    Cypress.config('serverVersion') >= 3.4 &&
    Cypress.config('serverVersion') < 4.0 &&
    isEnterpriseEdition()
  ) {
    it('print pagecache stats in PROFILE', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(
        'PROFILE CYPHER runtime=compiled MATCH (n:VendorId {uid: "d8eedae3ef0b4c45a9a27308", vendor: "run"}) RETURN n.uid, n.vendor, id(n)',
        { parseSpecialCharSequences: false }
      )
      cy.get('[data-testid="planExpandButton"]', { timeout: 10000 }).click()
      const el = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
      el.should('contain', 'pagecache hits')
      el.should('contain', 'pagecache misses')
    })
  }
  it('outputs and preselects plan when using PROFILE', () => {
    cy.executeCommand(':clear')
    cy.executeCommand('CREATE (:Tag)')
    cy.executeCommand(':clear')
    cy.executeCommand(`PROFILE MATCH (tag:Tag){shift}{enter}WHERE tag.name IN ["Eutheria"]
WITH tag
MATCH (publication)-[:HAS_TAG]->(tag)
WHERE SIZE([(publication)-[:HAS_TAG]->() | publication]) = 1
WITH publication, tag
MATCH (expert)-[:PUBLISHED]->(publication)
WITH expert, collect(DISTINCT publication) AS publications, count(DISTINCT publication) AS relevantNumberOfPublications
RETURN expert.name, publications, relevantNumberOfPublications, 1 AS relevantNumberOfTags
ORDER BY relevantNumberOfPublications DESC
LIMIT 50;`)
    cy.get('[data-testid="planExpandButton"]', { timeout: 10000 }).click()
    const el = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
    el.then($el => {
      if ($el.text().includes('DirectedRelationshipTypeScan')) {
        el.should('contain', 'tag')
          .and('contain', ':Tag')
          .and('contain', 'Filter')
          .and('contain', 'EagerAggregation')
          .and('contain', 'Top')
          .and('contain', 'Projection')
          .and('contain', 'ProduceResults')
          .and('contain', 'relevantNumberOfPublications')
          .and('contain', 'relevantNumberOfTags')
          .and('contain', 'Result')
      } else {
        el.should('contain', 'tag')
          .and('contain', ':Tag')
          .and('contain', 'Filter')
          .and('contain', 'Expand(All)')
          .and('contain', 'EagerAggregation')
          .and('contain', 'Projection')
          .and('contain', 'ProduceResults')
          .and('contain', 'relevantNumberOfPublications')
          .and('contain', 'relevantNumberOfTags')
          .and('contain', 'Result')
      }

      cy.executeCommand(':clear')
      cy.executeCommand(
        'profile match (n:Person) with n where size ([(n)-[:Follows]->() | n]) > 6 return n;'
      )
      cy.get('[data-testid="planExpandButton"]', { timeout: 10000 }).click()
      const el2 = cy.get('[data-testid="planSvg"]', { timeout: 10000 })
      el2.should('contain', 'NodeByLabelScan', { timeout: 10000 })
    })
  })
})

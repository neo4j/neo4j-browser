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

/* global Cypress, cy, test, expect, before, after */

describe('Plan output', () => {
  before(function () {
    cy.visit(Cypress.config.url)
      .title()
      .should('include', 'Neo4j Browser')
    cy.disableEditorAutocomplete()
  })
  after(function () {
    cy.enableEditorAutocomplete()
  })
  it('can connect', () => {
    const password = Cypress.config.password
    cy.connect(
      'neo4j',
      password
    )
  })
  if (Cypress.config.serverVersion >= 3.5) {
    it('print Order in PROFILE', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(`CREATE INDEX ON :Person(age)`)
      cy.executeCommand(
        `EXPLAIN MATCH (n:Person) WHERE n.age > 18 RETURN n.name ORDER BY n.age`
      )
      cy.get('[data-test-id="planExpandButton"]', { timeout: 10000 }).click()
      const el = cy.get('[data-test-id="planSvg"]', { timeout: 10000 })
      el.should('contain', 'Order by index: n.age ASC')
    })
  }
  if (Cypress.config.serverVersion >= 3.4) {
    it('print pagecache stats in PROFILE', () => {
      cy.executeCommand(':clear')
      cy.executeCommand(
        `PROFILE MATCH (n:VendorId {{}uid: "d8eedae3ef0b4c45a9a27308", vendor: "run"}) RETURN n.uid, n.vendor, id(n)`
      )
      cy.get('[data-test-id="planExpandButton"]', { timeout: 10000 }).click()
      const el = cy.get('[data-test-id="planSvg"]', { timeout: 10000 })
      el.should('contain', 'pagecache hits')
      el.should('contain', 'pagecache misses')
    })
  }
  it('ouputs and preselects plan when using PROFILE', () => {
    cy.executeCommand(':clear')
    cy.executeCommand(`PROFILE MATCH (tag:Tag)
    WHERE tag.name IN ["Eutheria"]
    WITH tag
    MATCH (publication)-[:HAS_TAG]->(tag)
    WHERE SIZE((publication)-[:HAS_TAG]->()) = 1
    WITH publication, tag
    MATCH (expert)-[:PUBLISHED]->(publication)
    WITH expert, collect(DISTINCT publication) AS publications, count(DISTINCT publication) AS relevantNumberOfPublications
    RETURN expert.name, publications, relevantNumberOfPublications, 1 AS relevantNumberOfTags
    ORDER BY relevantNumberOfPublications DESC
    LIMIT 50;`)
    cy.get('[data-test-id="planExpandButton"]', { timeout: 10000 }).click()
    const el = cy.get('[data-test-id="planSvg"]', { timeout: 10000 })
    el.should('contain', 'NodeByLabelScan')
      .and('contain', 'tag')
      .and('contain', ':Tag')
      .and('contain', 'Filter')
      .and('contain', 'Expand(All)')
      .and('contain', 'publication, tag')
      .and('contain', '(tag)<-[') // Line breaks into next
      .and('contain', '-(publication)')
      .and('contain', ':PUBLISHED]-(expert)')
      .and('contain', 'EagerAggregation')
      .and('contain', 'Projection')
      .and('contain', 'ProduceResults')
      .and('contain', 'relevantNumberOfPublications')
      .and('contain', 'relevantNumberOfTags')
      .and('contain', 'Result')
    if ([3.5].includes(Cypress.config.serverVersion)) {
      el.should('contain', 'tag.name IN').and('contain', 'GetDegree')
    } else if ([3.3, 3.4].includes(Cypress.config.serverVersion)) {
      el.should('contain', 'tag.name IN').and('contain', 'GetDegreePrimitive')
    } else if (Cypress.config.serverVersion === 3.2) {
      el.should('contain', 'ConstantCachedIn').and('contain', 'GetDegree')
    }

    cy.executeCommand(':clear')
    cy.executeCommand(
      `profile match (n:Person) with n where size ( (n)-[:Follows]->()) > 6 return n;`
    )
    cy.get('[data-test-id="planExpandButton"]', { timeout: 10000 }).click()
    const el2 = cy.get('[data-test-id="planSvg"]', { timeout: 10000 })
    el2.should('contain', 'NodeByLabelScan')
    if ([3.3, 3.4].includes(Cypress.config.serverVersion)) {
      el2.should('contain', 'GetDegreePrimitive')
    } else if ([3.2, 3.5].includes(Cypress.config.serverVersion)) {
      el2.should('contain', 'GetDegree')
    }
  })
})

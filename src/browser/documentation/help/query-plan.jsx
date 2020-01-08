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

import React from 'react'
import ManualLink from 'browser-components/ManualLink'
const title = 'Query Plan'
const subtitle = 'Understand what cypher is doing'
const category = 'cypherQueries'
const content = (
  <>
    <div className="details">
      <p>
        Cypher breaks down the work of executing a query into small pieces
        called <em>operators</em>. Each operator is responsible for a small part
        of the overall query. The operators are connected together in a pattern
        called a Query Plan.
      </p>
      <p>
        When you use the <a help-topic="explain">EXPLAIN</a> or{' '}
        <a help-topic="profile">PROFILE</a> commands, Neo4j Browser displays a
        diagram of the Query Plan.
      </p>
      <p>
        Click the right arrow button for the later pages of this guide, which
        explain how to read the Query Plan diagram.
      </p>
    </div>
    <div className="details">
      <img
        src="./assets/images/query-plan.svg"
        className="img-responsive pull-right"
      />
    </div>
    <div className="details">
      <img
        src="./assets/images/query-plan-operator-rows.svg"
        className="img-responsive"
      />
    </div>
    <div className="details">
      <h4>Operators</h4>
      <p>
        Each Operator is displayed as a rectangle with its name in the top-left
        corner. See the{' '}
        <ManualLink chapter="cypher-manual" page="/execution-plans/">
          operators manual page
        </ManualLink>{' '}
        for a description of what each operator does.
      </p>
      <h4>Pipes</h4>
      <p>
        Operators are connected by pipes; each pipe represents the output of one
        operator and the input of the next.
      </p>
      <h4>Rows</h4>
      <p>
        In Query Plan diagrams, the width of a pipe indicates the number of rows
        that pass between operators. This means that by looking at the overall
        diagram, you can quickly see the <em>shape</em> of the query, in terms
        of which parts process lots of rows, and which parts process few.
      </p>
      <h4>Estimated rows</h4>
      <p>
        When you use the <a help-topic="explain">EXPLAIN</a> keyword, the query
        is not actually executed; so it's not possible to show actual number of
        rows for each pipe. In this case, the Query Plan diagram shows{' '}
        <em>estimated rows</em> instead. These numbers are predicted based on
        Neo4j's built-in statistics. The Cypher cost-based planner uses
        estimated rows to determine the optimal query plan.
      </p>
    </div>
    <div className="details">
      <img
        src="./assets/images/query-plan-operator-cost.svg"
        className="img-responsive"
      />
    </div>
    <div className="details">
      <h4>Database hits</h4>
      <p>
        Each operator will ask the Neo4j storage engine to do work such as
        retrieving or updating data. A <em>database hit</em> is an abstract unit
        of this storage engine work.
      </p>
      <p>
        When you use the <a help-topic="profile">PROFILE</a>
        command, the footer of the result frame displays the total number of
        database hits incurred while running the query. By comparing this total
        for different query plans, you can tell which one is better in terms of
        work for the storage engine.
      </p>
      <p>
        In addition of the total number of database hits, the Query Plan diagram
        shows the database hits for each individual operator. For operators with
        a large number of database hits, there is a red box underneath the
        operator, with its height proportional to the number. This means that
        you can glance very quickly at the whole Query Plan diagram and spot the
        operators that are responsible for significant storage engine work.
      </p>
    </div>
    <div className="details">
      <img
        src="./assets/images/query-plan-operator-details.svg"
        className="img-responsive"
      />
    </div>
    <div className="details">
      <h4>Click to expand</h4>
      <p>
        Some operators can reveal more information about what they are doing. If
        you see a triangular expand icon next to the operator name, you can
        click to expand the operator and reveal some more details. When you're
        done, you can click the header again to collapse the operator and hide
        the details.
      </p>
      <p>
        If you want to quickly expand all the operators, there are expand-all{' '}
        <i className="fa fa-caret-square-o-down" /> and collapse-all{' '}
        <i className="fa fa-caret-square-o-up" /> buttons below the diagram.
      </p>
      <h4>Identifiers</h4>
      <p>
        The first section of details lists the identifiers that the operator
        works with. if you've named identifers in your query, e.g.{' '}
        <code>MATCH (n)</code> then you should find the identifier n bound in
        one of the operators. In addition to identifiers that you named in your
        query you may see some internal identifiers that Cypher has introduced
        to keep track of unnamed entities.
      </p>
      <h4>Expressions</h4>
      <p>
        After the identifiers, you'll see a section for an expression. This is
        commonly a boolean expression such as <code>hasProp(born)</code> or it
        can be a graph pattern to be expanded such as <code>()-[r]-()</code>
      </p>
      <table className="table-condensed table-help">
        <tbody>
          <tr>
            <th>Reference:</th>
            <td>
              <ManualLink chapter="cypher-manual" page="/execution-plans/">
                Execution Plans
              </ManualLink>{' '}
              manual page
            </td>
          </tr>
          <tr>
            <th>Related:</th>
            <td>
              <a help-topic="explain">:help EXPLAIN</a>{' '}
              <a help-topic="profile">:help PROFILE</a>{' '}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </>
)

export default { title, subtitle, category, content }

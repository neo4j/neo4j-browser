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
const title = 'PROFILE'
const subtitle = 'Profile query execution'
const category = 'executionPlans'
const content = (
  <>
    <p>
      Prefix any query with the <code>PROFILE</code> keyword to have Neo4j
      return the execution plan for the query, including detailed profiling
      information.
    </p>
    <p>
      See <a help-topic="query plan">:help QUERY PLAN</a> for a guide to
      understanding the query plan output.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference:</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/execution-plans/">
            Execution Plans
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="explain">:help EXPLAIN</a>{' '}
          <a help-topic="query plan">:help QUERY PLAN</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          PROFILE MATCH (n:Person) RETURN n LIMIT 25
        </pre>
        <figcaption>
          Find nodes with the Person label, and profile query execution.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

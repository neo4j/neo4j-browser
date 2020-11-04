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
const title = 'EXPLAIN'
const subtitle = 'Explain query execution'
const category = 'executionPlans'
const content = (
  <>
    <p>
      Prefix any query with the <code>EXPLAIN</code> keyword to have Neo4j
      return the execution plan it would use to execute the query. However, the
      query is not executed, and Neo4j will make no changes to the database.
    </p>
    <p>
      See <a help-topic="query plan">:help QUERY PLAN</a> for a guide to
      understanding the query plan output.
    </p>
    <table className="table-condensed table-help">
      <tbody>
        {/* <tr>
          <th>Reference:</th>
          <td><code><a href='{{ neo4j.version | neo4jDeveloperDoc }}/#execution-plans'>Execution Plans</a></code> manual page</td>
        </tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic="profile">:help PROFILE</a>{' '}
            <a help-topic="query plan">:help QUERY PLAN</a>{' '}
          </td>
        </tr>
      </tbody>
    </table>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          EXPLAIN MATCH (n:Person) RETURN n LIMIT 25
        </pre>
        <figcaption>
          Show the query plan that would be used to find nodes with the Person
          label, without actually executing the plan.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

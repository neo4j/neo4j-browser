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
const title = 'WITH'
const subtitle = 'A graph query language'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The <code>WITH</code> clause allows queries to be chained together, piping
      the results from one to be used as starting points or criteria in the
      next.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/clauses/with/">
            WITH
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="match">:help MATCH</a>{' '}
          <a help-topic="return">:help RETURN</a>{' '}
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure className="runnable">
        <pre>
          {`MATCH (director:Person)-[:DIRECTED]->(movie)
WITH director, count(movie) as directed ORDER BY directed DESC LIMIT 1
MATCH (hopeful:Person)-[:ACTED_IN]->(movie)
WITH director, hopeful, count(movie) as appearances ORDER BY appearances LIMIT 1
MATCH p=(director)-[*..4]-(hopeful)
RETURN p`}
        </pre>
        <figcaption>
          Find a path from a hopeful actor to Hollywood's most prolific
          director.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

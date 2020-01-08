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
const title = 'MATCH'
const subtitle = 'Describe a data pattern'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The <code>MATCH</code> clause describes a pattern of graph data. Neo4j
      will collect all paths within the graph which match this pattern. This is
      often used with <code>WHERE</code> to filter the collection.
    </p>
    <p>
      The <code>MATCH</code> describes the structure, and <code>WHERE</code>{' '}
      specifies the content of a query.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/clauses/match/">
            MATCH
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="where">:help WHERE</a>
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure className="runnable">
        <pre>
          {`MATCH (director:Person)-[:DIRECTED]->(movie)
WHERE director.name = "Steven Spielberg"
RETURN movie.title`}
        </pre>
        <figcaption>
          Find all the many fine films directed by Steven Spielberg.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

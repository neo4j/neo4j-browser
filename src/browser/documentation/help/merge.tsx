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
const title = 'MERGE'
const subtitle = 'Create missing graph data'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The <code>MERGE</code> clause ensures that an expected pattern exists in
      the graph, reconciling whether data was found, or needs to be created
      through sub-clauses <code>ON CREATE</code> and <code>ON MATCH</code>
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/clauses/merge/">
            MERGE
          </ManualLink>{' '}
          manual page
          <br />
          <ManualLink
            chapter="cypher-manual"
            page="/clauses/merge/#query-merge-on-create-on-match"
          >
            ON CREATE and ON MATCH
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="match">:help MATCH</a>
          <a help-topic="create">:help CREATE</a>
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure className="runnable">
        <pre>
          {`MERGE (charlie:Person { name:'Charlie Sheen', age:10 })
RETURN charlie`}
        </pre>
        <figcaption>
          Look for a person named Charlie Sheen, age 10. If not found, create
          such a person.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

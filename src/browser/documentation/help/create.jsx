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
const title = 'CREATE'
const subtitle = 'Insert graph data'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The
      <code>CREATE</code> clause is used to create data by specifying named
      nodes and relationships with inline properties.
    </p>
    <p>
      Use
      <code>MATCH</code> clauses for reading data, and
      <code>CREATE</code> or
      <code>MERGE</code> for writing data.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/clauses/create/">
            CREATE
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="set">:help SET</a>
          <a help-topic="merge">:help MERGE</a>
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
      <div className="link">
        <p className="title">Guide</p>
        <p className="content">
          <a play-topic="cypher">Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable">
          {`CREATE (le:Person {name: Euler }),
  (db:Person {name: Bernoulli }),
  (le)-[:KNOWS {since:1768}]->(db)
  RETURN le, db`}
        </pre>
        <figcaption>Create two related people, returning them.</figcaption>
      </figure>
    </section>
  </>
)
export default { title, subtitle, category, content }

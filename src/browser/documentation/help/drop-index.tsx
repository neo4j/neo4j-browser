/*
 * Copyright (c) "Neo4j"
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

const title = 'DROP INDEX'
const subtitle = 'Drop a schema index'
const category = 'schemaClauses'
const content = (
  <>
    <p>
      The <code>DROP INDEX</code> clause will drop an index using its name.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink
            chapter="cypher-manual"
            page="/indexes-for-search-performance/"
          >
            Indexes for search performance
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="create-index-for">:help CREATE INDEX FOR</a>
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <p>On neo4j version 4 and later</p>
        <pre className="code runnable standalone-example">SHOW INDEXES</pre>
        <pre className="code runnable standalone-example">
          DROP INDEX IndexName
        </pre>
        <p>On neo4j version 3.X</p>
        <pre className="code runnable standalone-example">
          DROP INDEX ON :Person(name)
        </pre>
        <figcaption>
          Drop the index named <code>IndexName</code>.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

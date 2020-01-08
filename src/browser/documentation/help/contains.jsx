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
const title = 'CONTAINS'
const subtitle = 'Matching within in a string'
const category = 'cypherPredicates'
const content = (
  <>
    <p>
      The occurrence of a string within a string can be matched using{' '}
      <code>CONTAINS</code>. The matching is case-sensitive.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink
            chapter="cypher-manual"
            page="/clauses/where/#query-where-string"
          >
            WHERE
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="starts-with">:help STARTS WITH</a>{' '}
          <a help-topic="ends-with">:help ENDS WITH</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          MATCH (director:Person) WHERE director.name CONTAINS 'ete' RETURN
          director.name
        </pre>
        <figcaption>
          Match directors with a name that contains with "eter".
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

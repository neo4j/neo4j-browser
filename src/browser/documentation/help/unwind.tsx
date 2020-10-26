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
const title = 'UNWIND'
const subtitle = 'Unwind a collection into a sequence of rows'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The <code>UNWIND</code> expands a collection in to a sequence of rows. Any
      existing identifiers are still available after <code>UNWIND</code>.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/clauses/unwind/">
            UNWIND
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="match">:help MATCH</a>
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure className="runnable">
        <pre>
          {`MATCH p = shortestPath( (lucy:Person {name:"Lucy Liu"})-[:ACTED_IN*]-(bacon:Person {name:"Kevin Bacon"}) )
UNWIND nodes(p) as n
RETURN n.name`}
        </pre>
        <figcaption>
          Return a set of actors that form the shortest acquaintance links
          between Lucy Liu and Kevin Bacon.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

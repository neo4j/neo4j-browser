/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
const title = 'RETURN'
const subtitle = 'data from a query'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>
      The <code>RETURN</code> clause defines what to include in a query result
      set, specified as a comma separated list of expressions.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/return/'
            >
              RETURN
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='match'>:help MATCH</a>{' '}
          <a help-topic='where'>:help WHERE</a>{' '}
          <a help-topic='cypher'>:help Cypher</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MATCH (director:Person)-[:DIRECTED]->(movie)
RETURN director.name AS Director, collect(movie.title) AS Movies`}</pre>
        <figcaption>
          Return all directors, each paired with a collection of the movies
          they've directed.
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }

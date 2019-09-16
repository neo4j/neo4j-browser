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
const title = 'ENDS WITH'
const subtitle = 'Matching the end of a string'
const category = 'cypherPredicates'
const content = (
  <React.Fragment>
    <p>
      The end of strings can be matched using <code>ENDS WITH</code>. The
      matching is case-sensitive.
    </p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <code>
            <a
              target='_blank'
              href='https://neo4j.com/docs/developer-manual/3.2/cypher/clauses/where/'
            >
              WHERE
            </a>{' '}
            manual page
          </code>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='starts-with'>:help STARTS WITH</a>
          <a help-topic='contains'>:help CONTAINS</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure className='runnable'>
        <pre>{`MATCH (director:Person)
WHERE director.name ENDS WITH 'ter'
RETURN director.name`}</pre>
        <figcaption>
          Match directors with a name that ends with "ter".
        </figcaption>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }

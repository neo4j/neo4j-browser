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
const title = 'Schema'
const subtitle = 'Database schema indexes'
const category = 'cypherHelp'
const content = (
  <React.Fragment>
    <p>Shows information about database schema indexes and constraints.</p>
    <div className='links'>
      <div className='link'>
        <p className='title'>Reference</p>
        <p className='content'>
          <a
            target='_blank'
            href='https://neo4j.com/docs/developer-manual/3.2/cypher/schema/'
          >
            Cypher Schema
          </a>
        </p>
      </div>
      <div className='link'>
        <p className='title'>Related</p>
        <p className='content'>
          <a help-topic='create-index-on'>:help CREATE INDEX ON</a>
          <a help-topic='drop-index-on'>:help DROP INDEX ON</a>
          <a help-topic='create-constraint-on'>:help CREATE CONSTRAINT ON</a>
          <a help-topic='drop-constraint-on'>:help DROP CONSTRAINT ON</a>
        </p>
      </div>
    </div>
    <section className='example'>
      <figure>
        <pre className='code runnable standalone-example'>:schema</pre>
      </figure>
    </section>
  </React.Fragment>
)

export default { title, subtitle, category, content }

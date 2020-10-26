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
import DbsOnSystemDb from './partials/dbs-on-systemdb'
const title = 'CREATE DATABASE'
const subtitle = 'Create a new database'
const category = 'administration'
const content = (
  <>
    <p>
      The command <code>CREATE DATABASE</code> can be used to create a database.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink
            chapter="cypher-manual"
            page="/administration/databases/#administration-databases-create-database"
            minVersion="4.0.0"
          >
            CREATE DATABASE
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="show-databases">:help SHOW DATABASES</a>{' '}
          <a help-topic="drop-database">:help DROP DATABASE</a>{' '}
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          CREATE DATABASE customers
        </pre>
      </figure>
    </section>
    <DbsOnSystemDb />
  </>
)
export default { title, subtitle, category, content }

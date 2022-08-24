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

const title = 'SCHEMA'
const subtitle = 'Database schema indexes'
const category = 'schemaClauses'
const content = (
  <>
    <p>Shows information about database schema indexes and constraints.</p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/administration/">
            Neo4j Database Administration
          </ManualLink>
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="create-index">:help CREATE INDEX</a>
          <a help-topic="drop-index">:help DROP INDEX</a>
          <a help-topic="create-constraint">:help CREATE CONSTRAINT</a>
          <a help-topic="drop-constraint">:help DROP CONSTRAINT</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">:schema</pre>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

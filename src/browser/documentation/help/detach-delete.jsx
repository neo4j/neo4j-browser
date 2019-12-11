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
import ManualLink from 'browser-components/ManualLink'
const title = 'DETACH DELETE'
const subtitle = 'Delete all nodes and relationships'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The <code>DETACH DELETE</code> clause is used to delete all nodes and
      relationships.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="developer-manual" page="/cypher/clauses/delete/">
            DELETE
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="delete">:help DELETE</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure className="runnable">
        <pre>MATCH (n) DETACH DELETE n</pre>
        <figcaption>Delete all nodes and relationships.</figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

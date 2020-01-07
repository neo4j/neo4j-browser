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
const title = 'DELETE'
const subtitle = 'Delete nodes and relationships'
const category = 'cypherHelp'
const content = (
  <>
    <p>
      The <code>DELETE</code> clause is used to delete nodes and relationships
      identified within a <code>MATCH</code> clause, possibly qualified by a{' '}
      <code>WHERE</code>. Remember that you can not delete a node without also
      deleting relationships that start or end on said node.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink chapter="cypher-manual" page="/clauses/delete/">
            DELETE
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="detach-delete">:help DETACH DELETE</a>
          <a help-topic="match">:help MATCH</a>
          <a help-topic="where">:help WHERE</a>
          <a help-topic="remove">:help REMOVE</a>
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure className="runnable">
        <pre>
          {`MATCH (n)-[r]-()
WHERE n.name = 'Soren'
DELETE r`}
        </pre>
        <figcaption>Remove all of Soren's friends.</figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

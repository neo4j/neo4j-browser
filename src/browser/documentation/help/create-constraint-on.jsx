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
const title = 'CREATE CONSTRAINT ON'
const subtitle =
  'Create a property constraint on a node label or relationship type'
const category = 'schemaClauses'
const content = (
  <>
    <p>
      The <code>CREATE CONSTRAINT ON</code> clause will create a property
      constraint on all nodes/relationships that have the specified label/type.
    </p>
    <p>
      The <code>IS UNIQUE</code> property constraint will create an accompanying
      index.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink
            chapter="cypher-manual"
            page="/administration/constraints/"
          >
            Constraints
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <div className="title">Related</div>
        <div className="content">
          <a help-topic="drop-constraint-on">:help DROP CONSTRAINT ON</a>{' '}
          <a help-topic="schema">:help Schema</a>{' '}
          <a help-topic="cypher">:help Cypher</a>
        </div>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          CREATE CONSTRAINT ON (p:Person) ASSERT p.name IS UNIQUE
        </pre>
        <figcaption>
          Create a unique property constraint on the label Person and property
          name.
        </figcaption>
      </figure>
    </section>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          CREATE CONSTRAINT ON (p:Person) ASSERT exists(p.name)
        </pre>
        <figcaption>
          Create a node property existence constraint on the label Person and
          property name.
        </figcaption>
      </figure>
    </section>
    <section className=" example">
      <figure>
        <pre className="code runnable standalone-example">
          CREATE CONSTRAINT ON ()-[l:LIKED]-() ASSERT exists(l.when)
        </pre>
        <figcaption>
          Create a relationship property existence constraint on the type LIKED
          and property when.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

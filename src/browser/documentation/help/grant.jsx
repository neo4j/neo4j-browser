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
import AdminOnSystemDb from './partials/admin-on-systemdb'
const title = 'GRANT'
const subtitle = 'Grant privileges to roles'
const category = 'security'
const content = (
  <>
    <p>
      The <code>GRANT</code> command allows an administrator to grant a
      privilege to a role in order to access an entity.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Reference</p>
        <p className="content">
          <ManualLink
            chapter="cypher-manual"
            page="/administration/security/subgraph/#administration-security-subgraph-introduction"
            minVersion="4.0.0"
          >
            Subgraph security
          </ManualLink>{' '}
          manual page
          <br />
          <ManualLink
            chapter="cypher-manual"
            page="/administration/security/administration/#administration-security-administration-database-privileges"
            minVersion="4.0.0"
          >
            Database administration
          </ManualLink>{' '}
          manual page
        </p>
      </div>
      <div className="link">
        <p className="title">Related</p>
        <p className="content">
          <a help-topic="show-privileges">:help SHOW PRIVILEGES</a>{' '}
          <a help-topic="revoke">:help REVOKE</a>{' '}
          <a help-topic="deny">:help DENY</a>{' '}
          <a help-topic="cypher">:help Cypher</a>
        </p>
      </div>
    </div>
    <section className="example">
      <figure>
        <pre className="code runnable standalone-example">
          GRANT graph-privilege ON GRAPH dbname entity TO role
        </pre>
        <figcaption>
          Grant a subgraph privilege to a role (eg. write nodes/relationships).
        </figcaption>
      </figure>
      <figure>
        <pre className="code runnable standalone-example">
          GRANT database-privilege ON DATABASE dbname TO role
        </pre>
        <figcaption>
          Grant a database administrative privilege to a role (eg. create index
          or start/stop database).
        </figcaption>
      </figure>
    </section>
    <AdminOnSystemDb />
  </>
)
export default { title, subtitle, category, content }

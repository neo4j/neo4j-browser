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
const title = 'REST DELETE'
const category = 'restApiCommands'
const content = (
  <>
    <p>
      Use <code>:DELETE</code> to send HTTP DELETE to Neo4j's REST interface.
    </p>
    <table className="table-condensed table-help">
      <tbody>
        {/* <tr>
        <th>Reference:</th>
        <td><code><a href='{{ neo4j.version | neo4jDeveloperDoc }}/#http-api-index'>REST</a></code></td>
      </tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic="rest-get">:help REST GET</a>
            <a help-topic="rest-post">:help REST POST</a>
            <a help-topic="rest-put">:help REST PUT</a>
          </td>
        </tr>
      </tbody>
    </table>
    <section className="example">
      <figure>
        <pre mode="rest" className="code runnable">
          :DELETE /db/data/transaction/2
        </pre>
        <figcaption>Rollback an open transaction.</figcaption>
      </figure>
    </section>
  </>
)

export default { title, category, content }

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
const title = 'Bolt'
const subtitle = 'Using Bolt in Neo4j Browser'
const category = 'boltProtocol'
const content = (
  <React.Fragment>
    <p>
      By default, Neo4j Browser communicates with the database via Bolt using
      the Neo4j JavaScript Driver. However it is possible to turn off Bolt and
      communicate with the database using HTTP(S) as in older versions of Neo4j
      Browser.
    </p>
    <table className='table-condensed table-help'>
      <tbody>
        {/* <tr>
  <th>Reference:</th>
  <td><code><a href="{{ neo4j.version | neo4jDeveloperDoc }}/drivers">Drivers</a></code> manual page,  </td>
</tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic='bolt-encryption'>:help bolt encryption</a>{' '}
            <a help-topic='bolt-routing'>:help bolt routing</a>
          </td>
        </tr>
      </tbody>
    </table>
  </React.Fragment>
)

export default { title, subtitle, category, content }

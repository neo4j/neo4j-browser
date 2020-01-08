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
const title = 'Unrecognized command'
const content = (
  <>
    <p>Apologies, but that was unparseable or otherwise unrecognized</p>
    <table className="table-condensed table-help">
      <tbody>
        {/* <tr>
        <th className='lead'>You said:</th>
        <td><code className='lead'>{{frame.input | uncomment}}</code></td>
      </tr> */}
        <tr>
          <th>Try:</th>
          <td>
            <ul>
              <li>
                <a help-topic="help">:help</a> - for general help about using
                Neo4j Browser
              </li>
              <li>
                <a help-topic="cypher">:help commands</a> - to see available
                commands
              </li>
              <li>
                <a href="https://neo4j.com/docs/">Neo4j Documentation</a> - for
                detailed information about Neo4j
              </li>
            </ul>
          </td>
        </tr>
        <tr>
          <th>Keys:</th>
          <td>
            <ul>
              <li>
                <code>{'< ctrl - ↑ >'}</code> to retrieve previous entry from
                history.
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </>
)

export default { title, content }

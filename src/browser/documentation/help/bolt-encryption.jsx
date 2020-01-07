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
const title = 'Bolt encryption'
const subtitle = 'Certificate handling in web browsers'
const category = 'boltProtocol'
const content = (
  <>
    <p>
      Because of how web browsers handle (self signed) certificates the web
      browser needs to go to a HTTPS URL and accept / permanently trust the
      certificate before a secure Bolt connection to the server can be created.
    </p>
    <p>
      By default Neo4j offers a HTTPS URL on{' '}
      <a href="https://localhost:7473">https://localhost:7473</a>.
    </p>
    <p>
      You will need to manually view (usually by clicking in a broken padlock in
      the address bar) and trust the certificate to be able to create a secure
      connection.
    </p>
    <table className="table-condensed table-help">
      <tbody>
        {/* <tr>
  <th>Reference:</th>
  <td><code><a href="{{ neo4j.version | neo4jDeveloperDoc }}/drivers/#driver-authentication-encryption">Bolt encryption</a></code> manual section</td>
</tr> */}
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic="bolt">:help bolt</a>
          </td>
        </tr>
      </tbody>
    </table>
  </>
)

export default { title, subtitle, category, content }

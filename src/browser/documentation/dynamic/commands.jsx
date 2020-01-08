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

const title = 'Commands'
const subtitle = 'Typing commands is 1337'
const category = 'browserUiCommands'
const filter = ['help']
const description = (
  <>
    <p>
      In addition to composing and running Cypher queries, the editor bar up
      above ↑ understands a few client-side commands, which begin with a
      <code>:</code>. Without a colon, we'll assume you're trying to enter a
      Cypher query.
    </p>
    <table className="table-condensed table-help">
      <tbody>
        <tr>
          <th>Usage:</th>
          <td>
            <code>{':help <topic>'}</code>
          </td>
        </tr>
      </tbody>
    </table>
  </>
)

export default { title, subtitle, category, content: null, description, filter }

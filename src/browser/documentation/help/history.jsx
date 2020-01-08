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
const title = 'History'
const subtitle = 'Show command history'
const category = 'browserUiCommands'
const content = (
  <>
    <p>
      The <a exec-topic="history">:history</a> command will display your most
      recent executed commands.
    </p>
    <table className="table-condensed table-help">
      <tbody>
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic="history clear">:help history clear</a>
            <a help-topic="help">:help help</a>
            <a help-topic="commands">:help commands</a>
          </td>
        </tr>
      </tbody>
    </table>
  </>
)

export default { title, subtitle, category, content }

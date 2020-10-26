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
const title = 'Auto-committing transactions'
const subtitle = 'Execute a Cypher query within an auto-committing transaction'
const category = 'browserUiCommands'
const content = (
  <>
    <p>
      The <code>:auto</code> command will send the Cypher query following it, in
      an auto committing transaction. In general this is not recommended because
      of the lack of support for auto retrying on leader switch errors in
      clusters.
      <br />
      Some query types do however need to be sent in auto-committing
      transactions, <code>USING PERIODIC COMMIT</code> is the most notable one.
    </p>
    <table className="table-condensed table-help">
      <tbody>
        <tr>
          <th>Related:</th>
          <td>
            <a help-topic="load csv">:help load csv</a>
            <a help-topic="cypher">:help cypher</a>
            <a help-topic="commands">:help commands</a>
          </td>
        </tr>
      </tbody>
    </table>
    <section className="example">
      <figure>
        <pre>{`:auto USING PERIODIC COMMIT
LOAD CSV WITH HEADER FROM ... `}</pre>
        <figcaption>
          Example usage of the <em>:auto</em> command.
        </figcaption>
      </figure>
    </section>
  </>
)

export default { title, subtitle, category, content }

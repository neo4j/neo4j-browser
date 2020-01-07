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
const title = 'Keys'
const subtitle = 'Keyboard shortcuts'
const category = 'browserUiCommands'
const content = (
  <>
    <table className="table-condensed table-help table-help--keys">
      <thead>
        <tr>
          <th>Editor action</th>
          <th>Any mode</th>
          <th>Single-line mode</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Execute current command</td>
          <td>
            <div className="key code">{'<Ctrl-Return>'}</div>
          </td>
          <td>
            <div className="key code">{'<Return>'}</div>
          </td>
        </tr>
        <tr>
          <td>Previous command in history</td>
          <td>
            <div className="key code">{'<Ctrl-Up-Arrow>'}</div>
          </td>
          <td>
            <div className="key code">{'<Up-Arrow>'}</div>
          </td>
        </tr>
        <tr>
          <td>Next command in history</td>
          <td>
            <div className="key code">{'<Ctrl-Down-Arrow>'}</div>
          </td>
          <td>
            <div className="key code">{'<Down-Arrow>'}</div>
          </td>
        </tr>
        <tr>
          <td>Switch to multi-line editing</td>
          <td />
          <td>
            <div className="key code">{'<Shift-Return>'}</div>
          </td>
        </tr>
        <tr>
          <td />
        </tr>
        <tr>
          <th>Global actions</th>
          <th />
          <th />
        </tr>
        <tr>
          <td>Change focus to editor</td>
          <td>
            <div className="key code">/</div>
          </td>
        </tr>
        <tr>
          <td>Toggle fullscreen editor</td>
          <td>
            <div className="key code">Esc</div>
          </td>
        </tr>
        <tr>
          <td />
        </tr>
        <tr>
          <th>Platform specific</th>
          <th />
          <th />
        </tr>
        <tr>
          <td>Mac users</td>
          <td>
            Use <span className="key code">Cmd</span> instead of{' '}
            <span className="key code">Ctrl</span>
          </td>
        </tr>
      </tbody>
    </table>
  </>
)

export default { title, subtitle, category, content }

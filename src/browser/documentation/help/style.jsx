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
const title = 'Style'
const subtitle = 'Set visualization style'
const category = 'browserUiCommands'
const content = (
  <>
    <p>
      The <code>:style</code> command lets you modify the visual aspects of your
      graph.
    </p>
    <div className="links">
      <div className="link">
        <p className="title">Usage:</p>
        <p className="content">
          <code>{':style <action>'}</code>
        </p>
      </div>
      <div className="link">
        <p className="title">Actions:</p>
        <div className="content">
          <div>
            <code>:style</code> - Display the currently active style. Select and
            copy to edit it locally.
          </div>
          <div>
            <code>{':style <url>'}</code> - load style from an URL. Note that
            the server hosting the style file must accept cross origin requests.
          </div>
          <div>
            <code>:style reset</code> - Reset styling to it's default.
          </div>
        </div>
      </div>
    </div>
  </>
)

export default { title, subtitle, category, content }

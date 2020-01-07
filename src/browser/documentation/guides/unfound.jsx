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
const title = 'Not found'
const subtitle = 'No guide by that name.'
const content = (
  <>
    <p>Apologies, but there doesn't seem to be any content about that.</p>
    <h5>Try:</h5>
    <ul>
      <li>
        <a help-topic="help">:help</a> - for general help about using Neo4j
        Browser
      </li>
      <li>
        <a play-topic="start">:play start</a> - to see a few available guides
      </li>
      <li>
        <a href="https://neo4j.com/docs/">Neo4j Documentation</a> - for detailed
        information about Neo4j
      </li>
    </ul>
  </>
)

export default { title, subtitle, content }

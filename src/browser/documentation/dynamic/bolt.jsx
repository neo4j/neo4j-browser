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
const title = 'Bolt'
const subtitle = 'Using Bolt in Neo4j Browser'
const category = 'browserUiCommands'
const filter = ['bolt']
const description = (
  <>
    <p>
      By default, Neo4j Browser communicates with the database via Bolt using
      the Neo4j JavaScript Driver. However it is possible to turn off Bolt and
      communicate with the database using HTTP(S) as in older versions of Neo4j
      Browser.
    </p>
  </>
)

export default { title, subtitle, category, content: null, description, filter }

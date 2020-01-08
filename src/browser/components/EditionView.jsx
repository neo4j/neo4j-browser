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
import { Code } from '../modules/Stream/Queries/styled'

export const EnterpriseOnlyFrame = ({ command }) => {
  return (
    <div>
      <p>
        Unable to display <Code>{command}</Code> because the procedures required
        to run this frame are missing. These procedures are usually found in
        Neo4j Enterprise edition.
      </p>
      <p>
        Find out more over at{' '}
        <a href="https://neo4j.com/editions/" target="_blank">
          neo4j.com/editions
        </a>
      </p>
    </div>
  )
}

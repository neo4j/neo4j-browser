/*
 * Copyright (c) "Neo4j"
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
import { uniqBy } from 'lodash'
import React from 'react'
import styled from 'styled-components'

import {
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { escapeCypherIdentifier } from 'services/utils'
import { Database } from 'shared/modules/dbMeta/dbMetaDuck'

const Select = styled.select`
  width: 100%;
  height: 30px;
  color: ${props => props.theme.inputText};
`

const EMPTY_OPTION = 'Select db to use'

const HOUSE_EMOJI = '\u{1F3E0}'
const HOUR_GLASS_EMOJI = '\u{231B}'
const NBSP_CHAR = '\u{00A0}'

type DatabaseSelectorProps = {
  databases?: Database[]
  selectedDb?: string
  onChange?: (dbName: string) => void
}
export const DatabaseSelector = ({
  databases = [],
  selectedDb = '',
  onChange = () => undefined
}: DatabaseSelectorProps): JSX.Element | null => {
  if (databases.length === 0) {
    return null
  }
  const selectionChange = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>) => {
    if (target.value !== EMPTY_OPTION) {
      onChange(escapeCypherIdentifier(target.value))
    }
  }

  const databasesList: (Partial<Database> & {
    name: string
  })[] = selectedDb ? databases : [{ name: EMPTY_OPTION }, ...databases]

  // When connected to a cluster, we get duplicate dbs for each member
  const uniqDatabases = uniqBy(databasesList, 'name')

  const homeDb =
    uniqDatabases.find(db => db.home) || uniqDatabases.find(db => db.default)

  return (
    <DrawerSection>
      <DrawerSubHeader>Use database</DrawerSubHeader>
      <DrawerSectionBody>
        <Select
          value={selectedDb}
          data-testid="database-selection-list"
          onChange={selectionChange}
        >
          {uniqDatabases.map(db => {
            return (
              <option
                key={db.name}
                value={db.name}
                disabled={db.status === 'unknown'}
              >
                {db.name}
                {db === homeDb ? NBSP_CHAR + HOUSE_EMOJI : ''}
                {db.status === 'unknown' ? NBSP_CHAR + HOUR_GLASS_EMOJI : ''}
              </option>
            )
          })}
        </Select>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

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
import React from 'react'
import styled from 'styled-components'

import {
  DrawerSection,
  DrawerSectionBody,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import { escapeCypherIdentifier } from 'services/utils'
import { Alias, Database } from 'shared/modules/dbMeta/dbMetaDuck'

const Select = styled.select`
  width: 100%;
  height: 30px;
  color: ${props => props.theme.inputText};
`

const EMPTY_OPTION = 'Select db to use'

const HOUSE_EMOJI = '\u{1F3E0}'
const NBSP_CHAR = '\u{00A0}'

type DatabaseSelectorProps = {
  uniqueDatabases?: Database[]
  selectedDb: string
  onChange?: (dbName: string) => void
  aliases: Alias[]
}
export const DatabaseSelector = ({
  uniqueDatabases = [],
  selectedDb,
  aliases,
  onChange = () => undefined
}: DatabaseSelectorProps): JSX.Element | null => {
  if (uniqueDatabases.length === 0) {
    return null
  }
  const selectionChange = ({
    target
  }: React.ChangeEvent<HTMLSelectElement>) => {
    if (target.value !== EMPTY_OPTION) {
      onChange(escapeCypherIdentifier(target.value))
    }
  }

  const homeDb =
    uniqueDatabases.find(db => db.home) ||
    uniqueDatabases.find(db => db.default)

  const aliasList = aliases.flatMap(alias => {
    const aliasedDb = uniqueDatabases.find(db => db.name === alias.database)

    // Don't show composite aliases since they can't be queried directly
    if (alias.composite) {
      return []
    }

    if (aliasedDb === undefined) {
      return []
    }

    return {
      name: alias.name,
      status: aliasedDb.status
    }
  })

  const databasesAndAliases = [...aliasList, ...uniqueDatabases].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <DrawerSection>
      <DrawerSubHeader>Use database</DrawerSubHeader>
      <DrawerSectionBody>
        <Select
          value={selectedDb}
          data-testid="database-selection-list"
          onChange={selectionChange}
        >
          {!Boolean(selectedDb) && (
            <option value={EMPTY_OPTION}>{EMPTY_OPTION}</option>
          )}

          {databasesAndAliases.map(dbOrAlias => {
            /* When deduplicating the list of databases and aliases on clusters
             we prefer to find ones that are "online". If our deduplicated
             db is not online, it means none of the databases on the cluster with
             that name is online, so we should disable it in the list and show 
             one of the statuses as a simplification (even though they could 
              technically be different)
             */
            const dbNotOnline = dbOrAlias.status !== 'online'

            return (
              <option
                key={dbOrAlias.name}
                value={dbOrAlias.name}
                disabled={dbNotOnline}
              >
                {dbOrAlias.name}
                {dbOrAlias === homeDb ? NBSP_CHAR + HOUSE_EMOJI : ''}
                {dbNotOnline && ` [${dbOrAlias.status}]`}
              </option>
            )
          })}
        </Select>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

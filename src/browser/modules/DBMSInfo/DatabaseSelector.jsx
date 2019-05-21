/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
  DrawerSubHeader,
  DrawerSectionBody
} from 'browser-components/drawer/index'

const Select = styled.select`
  width: 100%;
  height: 30px;
  color: ${props => props.theme.inputText};
`

export const DatabaseSelector = ({
  databases = [],
  defaultDb = 'neo4j',
  selectedDb = '',
  onChange = () => {}
}) => {
  if (!Array.isArray(databases) || databases.length < 1) {
    return null
  }
  const selectionChange = ({ target }) => {
    onChange(target.value)
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Use database</DrawerSubHeader>
      <DrawerSectionBody>
        <Select
          value={selectedDb || ''}
          data-testid='database-selection-list'
          onChange={selectionChange}
        >
          {databases.map(db => {
            const defaultStr = db.name === defaultDb ? ' - default' : ''
            return (
              <option key={db.name} value={db.name}>
                {db.name}
                {defaultStr} ({db.status})
              </option>
            )
          })}
        </Select>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

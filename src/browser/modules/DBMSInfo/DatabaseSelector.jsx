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
import {
  DrawerSection,
  DrawerSubHeader,
  DrawerSectionBody
} from 'browser-components/drawer/index'

export const DatabaseSelector = ({
  databases = [],
  selected = '',
  onChange = () => {}
}) => {
  if (!databases.length) {
    return null
  }
  let placeholder
  placeholder = (
    <option value='' key='placeholder'>
      DBMS default database
    </option>
  )
  const selectionChange = ({ target }) => {
    onChange(target.value)
  }
  return (
    <DrawerSection>
      <DrawerSubHeader>Use database</DrawerSubHeader>
      <DrawerSectionBody>
        <select
          value={selected || ''}
          data-testid='database-selection-list'
          onChange={selectionChange}
        >
          {placeholder}
          {databases.map(db => {
            return (
              <option key={db} value={db}>
                {db}
              </option>
            )
          })}
        </select>
      </DrawerSectionBody>
    </DrawerSection>
  )
}

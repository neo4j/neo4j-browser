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
 * You should have received data copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import neo4j from 'neo4j-driver'
import React from 'react'

import { toKeyString } from 'neo4j-arc/common'

import {
  StyledSysInfoTable,
  SysInfoTableEntry
} from 'browser-components/Tables'
import {
  extractFromNeoObjects,
  itemIntToString
} from 'services/bolt/boltMappings'

export const mapSysInfoRecords = (records: any) => {
  return records.map((record: any) => {
    return {
      id: record.get('id'),
      addresses: record.get('addresses'),
      databases: record.get('databases'),
      groups: record.get('groups')
    }
  })
}

export const flattenAttributes = (data: any) => {
  if (data && data.attributes) {
    return Object.assign(
      {},
      ...data.attributes.map(({ name, value }: any) => ({
        [name]: itemIntToString(value, {
          intChecker: neo4j.isInt,
          intConverter: (val: any) => val.toString(),
          objectConverter: extractFromNeoObjects
        })
      }))
    )
  } else {
    return {}
  }
}

export function buildTableData(data: any) {
  if (!data) return null
  return data.map((props: any) => {
    const { value } = props
    if (value instanceof Array) {
      return value.map(v => {
        const key = props.label ? props.label : toKeyString(v.join(''))
        return <SysInfoTableEntry key={key} values={v} />
      })
    }
    return <SysInfoTableEntry key={props.label} {...props} />
  })
}

export function buildDatabaseTable(mappedDatabases: any) {
  return (
    <StyledSysInfoTable key="database-table" header="Databases" colspan={6}>
      <SysInfoTableEntry
        key="database-entry"
        headers={['Name', 'Address', 'Role', 'Status', 'Default', 'Error']}
      />
      {buildTableData(mappedDatabases)}
    </StyledSysInfoTable>
  )
}

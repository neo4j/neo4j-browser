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
 * You should have received data copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import neo4j from 'neo4j-driver'
import React from 'react'
import {
  itemIntToString,
  extractFromNeoObjects
} from 'services/bolt/boltMappings'
import { SysInfoTableEntry } from 'browser-components/Tables'
import { toKeyString } from 'services/utils'

export const getTableDataFromRecords = records => {
  if (!records || !records.length) {
    return {}
  }
  const mappedJMXresults = mappedJMXresult(records)
  const jmxQueryPrefix = mappedJMXresults[0].name.split(',')[0]
  const result = Object.assign(
    {},
    ...mappedJMXresults.map(item => {
      return { [item.name]: item }
    })
  )
  const cache =
    flattenAttributes(result[`${jmxQueryPrefix},name=Page cache`]) || {}
  const primitive =
    flattenAttributes(result[`${jmxQueryPrefix},name=Primitive count`]) || {}
  const tx =
    flattenAttributes(result[`${jmxQueryPrefix},name=Transactions`]) || {}
  const kernel = {
    ...flattenAttributes(result[`${jmxQueryPrefix},name=Configuration`]),
    ...flattenAttributes(result[`${jmxQueryPrefix},name=Kernel`]),
    ...flattenAttributes(result[`${jmxQueryPrefix},name=Store file sizes`]),
    ...flattenAttributes(result[`${jmxQueryPrefix},name=Store sizes`])
  }
  const ha = result[`${jmxQueryPrefix},name=High Availability`]
    ? flattenAttributes(result[`${jmxQueryPrefix},name=High Availability`])
    : null

  return {
    cache,
    primitive,
    tx,
    kernel,
    ha
  }
}

const mappedJMXresult = records => {
  return records.map(record => {
    const origAttributes = record.get('attributes')
    return {
      name: record.get('name'),
      attributes: Object.keys(record.get('attributes')).map(attributeName => {
        return {
          name: attributeName,
          value: origAttributes[attributeName].value
        }
      })
    }
  })
}

export const mapSysInfoRecords = records => {
  return records.map(record => {
    return {
      id: record.get('id'),
      addresses: record.get('addresses'),
      databases: record.get('databases'),
      groups: record.get('groups')
    }
  })
}

export const mapLegacySysInfoRecords = records => {
  return records.map(record => {
    return {
      id: record.get('id'),
      addresses: record.get('addresses'),
      role: record.get('role'),
      groups: record.get('groups'),
      database: record.get('database')
    }
  })
}

export const flattenAttributes = data => {
  if (data && data.attributes) {
    return Object.assign(
      {},
      ...data.attributes.map(({ name, value }) => ({
        [name]: itemIntToString(value, {
          intChecker: neo4j.isInt,
          intConverter: val => val.toString(),
          objectConverter: extractFromNeoObjects
        })
      }))
    )
  } else {
    return {}
  }
}

export function buildTableData(data) {
  if (!data) return null
  return data.map(props => {
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

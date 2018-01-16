/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

import bolt from 'services/bolt/bolt'
import {
  itemIntToString,
  extractFromNeoObjects
} from 'services/bolt/boltMappings'

export const getTableDataFromRecords = records => {
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
  const primitive = flattenAttributes(
    result[`${jmxQueryPrefix},name=Primitive count`]
  )
  const tx =
    flattenAttributes(result[`${jmxQueryPrefix},name=Transactions`]) || {}
  const kernel = Object.assign(
    {},
    flattenAttributes(result[`${jmxQueryPrefix},name=Configuration`]),
    flattenAttributes(result[`${jmxQueryPrefix},name=Kernel`]),
    flattenAttributes(result[`${jmxQueryPrefix},name=Store file sizes`])
  )
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
      description: record.get('description'),
      attributes: Object.keys(record.get('attributes')).map(attributeName => {
        return {
          name: attributeName,
          description: origAttributes[attributeName].description,
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
      role: record.get('role'),
      groups: record.get('groups')
    }
  })
}

export const flattenAttributes = data => {
  if (data && data.attributes) {
    return Object.assign(
      {},
      ...data.attributes.map(({ name, value }) => ({
        [name]: itemIntToString(value, {
          intChecker: bolt.neo4j.isInt,
          intConverter: val => val.toString(),
          objectConverter: extractFromNeoObjects
        })
      }))
    )
  } else {
    return null
  }
}

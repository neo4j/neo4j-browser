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

import updateStatsFields from './updateStatisticsFields'
import { flatten, map, take } from 'lodash-es'
import neo4j from 'neo4j-driver'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'
import {
  safetlyRemoveObjectProp,
  safetlyAddObjectProp,
  escapeReservedProps,
  unEscapeReservedProps
} from '../utils'

export const reservedTypePropertyName = 'transport-class'

export function toObjects(records, converters) {
  const recordValues = records.map(record => {
    const out = []
    record.forEach(val => out.push(itemIntToString(val, converters)))
    return out
  })
  return recordValues
}

export function recordsToTableArray(records, converters) {
  const recordValues = toObjects(records, converters)
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

export function itemIntToString(item, converters) {
  const res = stringModifier(item)
  if (res) return res
  if (converters.intChecker(item)) return converters.intConverter(item)
  if (Array.isArray(item)) return arrayIntToString(item, converters)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (typeof item === 'object') return objIntToString(item, converters)
}

export function arrayIntToString(arr, converters) {
  return arr.map(item => itemIntToString(item, converters))
}

export function objIntToString(obj, converters) {
  const entry = converters.objectConverter(obj, converters)
  let newObj = null
  if (Array.isArray(entry)) {
    newObj = entry.map(item => itemIntToString(item, converters))
  } else if (entry !== null && typeof entry === 'object') {
    newObj = {}
    Object.keys(entry).forEach(key => {
      newObj[key] = itemIntToString(entry[key], converters)
    })
  }
  return newObj
}

export function extractFromNeoObjects(obj, converters) {
  if (
    obj instanceof neo4j.types.Node ||
    obj instanceof neo4j.types.Relationship
  ) {
    return obj.properties
  } else if (obj instanceof neo4j.types.Path) {
    return [].concat.apply([], extractPathForRows(obj, converters))
  }
  return obj
}

const extractPathForRows = (path, converters) => {
  let segments = path.segments
  // Zero length path. No relationship, end === start
  if (!Array.isArray(path.segments) || path.segments.length < 1) {
    segments = [{ ...path, end: null }]
  }
  return segments.map(segment =>
    [
      objIntToString(segment.start, converters),
      objIntToString(segment.relationship, converters),
      objIntToString(segment.end, converters)
    ].filter(part => part !== null)
  )
}

export function extractPlan(result, calculateTotalDbHits = false) {
  if (result.summary && (result.summary.plan || result.summary.profile)) {
    const rawPlan = result.summary.profile || result.summary.plan
    const boltPlanToRESTPlanShared = plan => {
      return {
        operatorType: plan.operatorType,
        DbHits: plan.dbHits,
        Rows: plan.rows,
        identifiers: plan.identifiers,
        children: plan.children.map(_ => ({
          ...transformPlanArguments(_.arguments),
          ...boltPlanToRESTPlanShared(_)
        }))
      }
    }
    const obj = {
      ...transformPlanArguments(rawPlan.arguments),
      ...boltPlanToRESTPlanShared(rawPlan)
    }

    if (calculateTotalDbHits === true) {
      obj.totalDbHits = collectHits(obj)
    }

    return { root: obj }
  }
  return null
}

const transformPlanArguments = args => {
  const res = { ...args }
  if (res.PageCacheHits) {
    res.PageCacheHits = res.PageCacheHits.toNumber()
  }
  if (res.PageCacheMisses) {
    res.PageCacheMisses = res.PageCacheMisses.toNumber()
  }
  return res
}

const collectHits = function(operator) {
  let hits = operator.DbHits || 0
  if (operator.children) {
    hits = operator.children.reduce((acc, subOperator) => {
      return acc + collectHits(subOperator)
    }, hits)
  }
  return hits
}

export function extractNodesAndRelationshipsFromRecords(
  records,
  types = neo4j.types,
  maxFieldItems
) {
  if (records.length === 0) {
    return { nodes: [], relationships: [] }
  }

  const { rawNodes, rawRels } = extractRawNodesAndRelationShipsFromRecords(
    records,
    types,
    maxFieldItems
  )

  return { nodes: rawNodes, relationships: rawRels }
}

export function extractNodesAndRelationshipsFromRecordsForOldVis(
  records,
  types,
  filterRels,
  converters,
  maxFieldItems
) {
  if (records.length === 0) {
    return { nodes: [], relationships: [] }
  }
  const { rawNodes, rawRels } = extractRawNodesAndRelationShipsFromRecords(
    records,
    types,
    maxFieldItems
  )

  const nodes = rawNodes.map(item => {
    return {
      id: item.identity.toString(),
      labels: item.labels,
      properties: itemIntToString(item.properties, converters)
    }
  })
  let relationships = rawRels
  if (filterRels) {
    relationships = rawRels.filter(
      item =>
        nodes.filter(node => node.id === item.start.toString()).length > 0 &&
        nodes.filter(node => node.id === item.end.toString()).length > 0
    )
  }
  relationships = relationships.map(item => {
    return {
      id: item.identity.toString(),
      startNodeId: item.start.toString(),
      endNodeId: item.end.toString(),
      type: item.type,
      properties: itemIntToString(item.properties, converters)
    }
  })
  return { nodes, relationships }
}

export const recursivelyExtractGraphItems = (types, item) => {
  if (item instanceof types.Node) return item
  if (item instanceof types.Relationship) return item
  if (item instanceof types.Path) return item
  if (Array.isArray(item)) {
    return item.map(i => recursivelyExtractGraphItems(types, i))
  }
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return false
  if (item === null) return false
  if (typeof item === 'object') {
    return Object.keys(item).map(key =>
      recursivelyExtractGraphItems(types, item[key])
    )
  }
  return item
}

export function extractRawNodesAndRelationShipsFromRecords(
  records,
  types = neo4j.types,
  maxFieldItems
) {
  const items = new Set()
  const paths = new Set()
  const segments = new Set()
  const rawNodes = new Set()
  const rawRels = new Set()

  for (const record of records) {
    for (const key of record.keys) {
      items.add(record.get(key))
    }
  }

  const flatTruncatedItems = flatten(
    map([...items], item =>
      maxFieldItems && Array.isArray(item) ? take(item, maxFieldItems) : item
    )
  )

  const findAllEntities = item => {
    if (item instanceof types.Relationship) {
      rawRels.add(item)
      return
    }
    if (item instanceof types.Node) {
      rawNodes.add(item)
      return
    }
    if (item instanceof types.Path) {
      paths.add(item)
      return
    }
    if (Array.isArray(item)) {
      for (const subItem of item) {
        findAllEntities(subItem)
      }
      return
    }
    if (item && typeof item === 'object') {
      for (const subItem of Object.values(item)) {
        findAllEntities(subItem)
      }
      return
    }
  }

  findAllEntities(flatTruncatedItems)

  for (const path of paths) {
    if (path.start) {
      rawNodes.add(path.start)
    }
    if (path.end) {
      rawNodes.add(path.end)
    }
    for (const segment of path.segments) {
      segments.add(segment)
    }
  }

  for (const segment of segments) {
    if (segment.start) {
      rawNodes.add(segment.start)
    }
    if (segment.end) {
      rawNodes.add(segment.end)
    }
    if (segment.relationship) {
      rawRels.add(segment.relationship)
    }
  }

  return { rawNodes: [...rawNodes], rawRels: [...rawRels] }
}

export const retrieveFormattedUpdateStatistics = result => {
  if (result.summary.counters) {
    const stats = result.summary.counters._stats
    const statsMessages = updateStatsFields
      .filter(field => stats[field.field] > 0)
      .map(
        field =>
          `${field.verb} ${stats[field.field]} ${
            stats[field.field] === 1 ? field.singular : field.plural
          }`
      )
    return statsMessages.join(', ')
  } else {
    return null
  }
}

export const flattenProperties = rows => {
  return rows.map(row =>
    row.map(entry => (entry && entry.properties ? entry.properties : entry))
  )
}

export const applyGraphTypes = (rawItem, types = neo4j.types) => {
  if (rawItem === null || rawItem === undefined) {
    return rawItem
  } else if (Array.isArray(rawItem)) {
    return rawItem.map(i => applyGraphTypes(i, types))
  } else if (
    Object.prototype.hasOwnProperty.call(rawItem, reservedTypePropertyName)
  ) {
    const item = { ...rawItem }
    const className = item[reservedTypePropertyName]
    const tmpItem = safetlyRemoveObjectProp(item, reservedTypePropertyName)
    switch (className) {
      case 'Node':
        return new types[className](
          applyGraphTypes(tmpItem.identity, types),
          tmpItem.labels,
          applyGraphTypes(tmpItem.properties, types)
        )
      case 'Relationship':
        return new types[className](
          applyGraphTypes(tmpItem.identity, types),
          applyGraphTypes(item.start, types),
          applyGraphTypes(item.end, types),
          item.type,
          applyGraphTypes(item.properties, types)
        )
      case 'PathSegment':
        return new types[className](
          applyGraphTypes(item.start, types),
          applyGraphTypes(item.relationship, types),
          applyGraphTypes(item.end, types)
        )
      case 'Path':
        return new types[className](
          applyGraphTypes(item.start, types),
          applyGraphTypes(item.end, types),
          item.segments.map(x => applyGraphTypes(x, types))
        )
      case 'Point':
        return new types[className](
          applyGraphTypes(item.srid),
          applyGraphTypes(item.x),
          applyGraphTypes(item.y),
          applyGraphTypes(item.z)
        )
      case 'Date':
        return new types[className](
          applyGraphTypes(item.year),
          applyGraphTypes(item.month),
          applyGraphTypes(item.day)
        )
      case 'DateTime':
        return new types[className](
          applyGraphTypes(item.year),
          applyGraphTypes(item.month),
          applyGraphTypes(item.day),
          applyGraphTypes(item.hour),
          applyGraphTypes(item.minute),
          applyGraphTypes(item.second),
          applyGraphTypes(item.nanosecond),
          applyGraphTypes(item.timeZoneOffsetSeconds),
          applyGraphTypes(item.timeZoneId)
        )
      case 'Duration':
        return new types[className](
          applyGraphTypes(item.months),
          applyGraphTypes(item.days),
          applyGraphTypes(item.seconds),
          applyGraphTypes(item.nanoseconds)
        )
      case 'LocalDateTime':
        return new types[className](
          applyGraphTypes(item.year),
          applyGraphTypes(item.month),
          applyGraphTypes(item.day),
          applyGraphTypes(item.hour),
          applyGraphTypes(item.minute),
          applyGraphTypes(item.second),
          applyGraphTypes(item.nanosecond)
        )
      case 'LocalTime':
        return new types[className](
          applyGraphTypes(item.hour),
          applyGraphTypes(item.minute),
          applyGraphTypes(item.second),
          applyGraphTypes(item.nanosecond)
        )
      case 'Time':
        return new types[className](
          applyGraphTypes(item.hour),
          applyGraphTypes(item.minute),
          applyGraphTypes(item.second),
          applyGraphTypes(item.nanosecond),
          applyGraphTypes(item.timeZoneOffsetSeconds)
        )
      case 'Integer':
        return neo4j.int(tmpItem)
      default:
        return item
    }
  } else if (typeof rawItem === 'object') {
    let typedObject = {}
    Object.keys(rawItem).forEach(key => {
      typedObject[key] = applyGraphTypes(rawItem[key], types)
    })
    typedObject = unEscapeReservedProps(typedObject, reservedTypePropertyName)
    return typedObject
  } else {
    return rawItem
  }
}

export const recursivelyTypeGraphItems = (item, types = neo4j.types) => {
  if (item === null || item === undefined) {
    return item
  }
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) {
    return item
  }
  if (Array.isArray(item)) {
    return item.map(i => recursivelyTypeGraphItems(i, types))
  }
  if (item instanceof types.Node) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Node')
    return tmp
  }
  if (item instanceof types.PathSegment) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'PathSegment')
    return tmp
  }
  if (item instanceof types.Path) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Path')
    return tmp
  }
  if (item instanceof types.Relationship) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Relationship')
    return tmp
  }
  if (item instanceof types.Point) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Point')
    return tmp
  }
  if (item instanceof types.Date) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Date')
    return tmp
  }
  if (item instanceof types.DateTime) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'DateTime')
    return tmp
  }
  if (item instanceof types.Duration) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Duration')
    return tmp
  }
  if (item instanceof types.LocalDateTime) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'LocalDateTime')
    return tmp
  }
  if (item instanceof types.LocalTime) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'LocalTime')
    return tmp
  }
  if (item instanceof types.Time) {
    const tmp = copyAndType(item, types)
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Time')
    return tmp
  }
  if (neo4j.isInt(item)) {
    const tmp = { ...item }
    safetlyAddObjectProp(tmp, reservedTypePropertyName, 'Integer')
    return tmp
  }
  if (typeof item === 'object') {
    const typedObject = {}
    const localItem = escapeReservedProps(item, reservedTypePropertyName)
    Object.keys(localItem).forEach(key => {
      typedObject[key] = recursivelyTypeGraphItems(localItem[key], types)
    })
    return typedObject
  }
  return item
}

function copyAndType(any, types = neo4j.types) {
  const keys = Object.keys(any)
  const tmp = {}
  keys.forEach(key => (tmp[key] = recursivelyTypeGraphItems(any[key], types)))
  return tmp
}

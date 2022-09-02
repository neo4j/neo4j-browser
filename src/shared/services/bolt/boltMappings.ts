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
import { flatten, map, take } from 'lodash-es'
import neo4j from 'neo4j-driver'

import { upperFirst, BasicNodesAndRels } from 'neo4j-arc/common'

import {
  escapeReservedProps,
  safelyAddObjectProp,
  safelyRemoveObjectProp,
  unEscapeReservedProps
} from '../utils'
import updateStatsFields from './updateStatisticsFields'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'

export const reservedTypePropertyName = 'transport-class'

interface Converters {
  intChecker: (item: {}) => boolean
  intConverter: (item: {}) => any
  objectConverter?: (item: {}, converters: Converters) => any
}

export function toObjects(
  records: typeof neo4j.Record[],
  converters: Converters
) {
  const recordValues = records.map(record => {
    const out: string[] = []
    record.forEach((val: {}) => out.push(itemIntToString(val, converters)))
    return out
  })
  return recordValues
}

export function recordsToTableArray(
  records: typeof neo4j.Record[],
  converters: Converters
) {
  const recordValues = toObjects(records, converters)
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

export function itemIntToString(item: any, converters: Converters): any {
  const res = stringModifier(item)
  if (res) return res
  if (converters.intChecker(item)) return converters.intConverter(item)
  if (Array.isArray(item)) return arrayIntToString(item, converters)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (typeof item === 'object') return objIntToString(item, converters)
}

export function arrayIntToString(arr: {}[], converters: Converters) {
  return arr.map(item => itemIntToString(item, converters))
}

export function objIntToString(obj: any, converters: any) {
  const entry = converters.objectConverter(obj, converters)
  let newObj: any = null
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

export function extractFromNeoObjects(obj: any, converters: Converters) {
  if (
    obj instanceof (neo4j.types.Node as any) ||
    obj instanceof (neo4j.types.Relationship as any)
  ) {
    return obj.properties
  } else if (obj instanceof (neo4j.types.Path as any)) {
    return [].concat.apply<any[], any[], any[]>(
      [],
      extractPathForRows(obj, converters)
    )
  }
  return obj
}

const extractPathForRows = (
  path: typeof neo4j.Path,
  converters: Converters
) => {
  let segments = path.segments
  // Zero length path. No relationship, end === start
  if (!Array.isArray(path.segments) || path.segments.length < 1) {
    segments = [{ ...path, end: null } as any]
  }
  return segments.map((segment: any) =>
    [
      objIntToString(segment.start, converters),
      objIntToString(segment.relationship, converters),
      objIntToString(segment.end, converters)
    ].filter(part => part !== null)
  )
}

export function extractPlan(result: any, calculateTotalDbHits = false) {
  if (result.summary && (result.summary.plan || result.summary.profile)) {
    const rawPlan = result.summary.profile || result.summary.plan
    const boltPlanToRESTPlanShared = (plan: any) => {
      return {
        operatorType: plan.operatorType,
        DbHits: plan.dbHits,
        Rows: plan.rows,
        identifiers: plan.identifiers,
        children: plan.children.map((_: any) => ({
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

const transformPlanArguments = (args: any) => {
  const res = { ...args }
  if (res.PageCacheHits) {
    res.PageCacheHits = res.PageCacheHits.toNumber()
  }
  if (res.PageCacheMisses) {
    res.PageCacheMisses = res.PageCacheMisses.toNumber()
  }
  return res
}

const collectHits = function (operator: any) {
  let hits = operator.DbHits || 0
  if (operator.children) {
    hits = operator.children.reduce((acc: any, subOperator: any) => {
      return acc + collectHits(subOperator)
    }, hits)
  }
  return hits
}

export function extractNodesAndRelationshipsFromRecords(
  records: Record<string, any>[],
  types = neo4j.types,
  maxFieldItems?: any
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

const getDriverTypeName = (val: any) => {
  const driverTypeMap = neo4j.types as any
  const driverTypes = Object.keys(neo4j.types)
  for (const type of driverTypes) {
    if (val instanceof driverTypeMap[type]) {
      return type
    }
  }
  return undefined
}

const getTypeDisplayName = (val: any): string => {
  const jsType = typeof val
  const complexType = jsType === 'object'

  if (jsType === 'number') {
    return 'Float'
  }

  if (!complexType) {
    return upperFirst(jsType)
  }

  if (val instanceof Array) {
    return `Array(${val.length})`
  }

  if (val === null) {
    return 'null'
  }

  return getDriverTypeName(val) || 'Unknown'
}

export function extractNodesAndRelationshipsFromRecordsForOldVis(
  records: Record<string, any>[],
  types: any,
  filterRels: any,
  converters: Converters,
  maxFieldItems?: any
): BasicNodesAndRels {
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
      properties: itemIntToString(item.properties, converters),
      propertyTypes: Object.entries(item.properties).reduce(
        (acc, [key, val]) => ({ ...acc, [key]: getTypeDisplayName(val) }),
        {}
      )
    }
  })
  let relationships = rawRels
  if (filterRels) {
    relationships = rawRels.filter(item => {
      const start = item.start.toString()
      const end = item.end.toString()
      return (
        nodes.some(node => node.id === start) &&
        nodes.some(node => node.id === end)
      )
    })
  }
  relationships = relationships.map(item => {
    return {
      id: item.identity.toString(),
      startNodeId: item.start.toString(),
      endNodeId: item.end.toString(),
      type: item.type,
      properties: itemIntToString(item.properties, converters),
      propertyTypes: Object.entries(item.properties).reduce(
        (acc, [key, val]) => ({ ...acc, [key]: getTypeDisplayName(val) }),
        {}
      )
    }
  })
  return { nodes, relationships }
}

export const recursivelyExtractGraphItems = (types: any, item: any): any => {
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
  records: Record<string, any>[],
  types = neo4j.types,
  maxFieldItems: any
) {
  const items = new Set<any>()
  const paths = new Set<any>()
  const segments = new Set<any>()
  const rawNodes = new Set<any>()
  const rawRels = new Set<any>()

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

  const findAllEntities = (item: any) => {
    if (item instanceof (types.Relationship as any)) {
      rawRels.add(item)
      return
    }
    if (item instanceof (types.Node as any)) {
      rawNodes.add(item)
      return
    }
    if (item instanceof (types.Path as any)) {
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

export const retrieveFormattedUpdateStatistics = (result: any) => {
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

export const flattenProperties = (rows: any) => {
  return rows.map((row: any) =>
    row.map((entry: any) =>
      entry && entry.properties ? entry.properties : entry
    )
  )
}

export const applyGraphTypes = (
  rawItem: any,
  types: any = neo4j.types
): any => {
  if (rawItem === null || rawItem === undefined) {
    return rawItem
  } else if (Array.isArray(rawItem)) {
    return rawItem.map(i => applyGraphTypes(i, types))
  } else if (
    Object.prototype.hasOwnProperty.call(rawItem, reservedTypePropertyName)
  ) {
    const item = { ...rawItem }
    const className = item[reservedTypePropertyName]
    const tmpItem = safelyRemoveObjectProp(item, reservedTypePropertyName)
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
          item.segments.map((x: any) => applyGraphTypes(x, types))
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
    let typedObject: Record<string, any> = {}
    Object.keys(rawItem).forEach(key => {
      typedObject[key] = applyGraphTypes(rawItem[key], types)
    })

    typedObject = unEscapeReservedProps(typedObject, reservedTypePropertyName)
    return typedObject
  } else {
    return rawItem
  }
}

export const recursivelyTypeGraphItems = (
  item: any,
  types: any = neo4j.types
): any => {
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
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Node')
    return tmp
  }
  if (item instanceof types.PathSegment) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'PathSegment')
    return tmp
  }
  if (item instanceof types.Path) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Path')
    return tmp
  }
  if (item instanceof types.Relationship) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Relationship')
    return tmp
  }
  if (item instanceof types.Point) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Point')
    return tmp
  }
  if (item instanceof types.Date) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Date')
    return tmp
  }
  if (item instanceof types.DateTime) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'DateTime')
    return tmp
  }
  if (item instanceof types.Duration) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Duration')
    return tmp
  }
  if (item instanceof types.LocalDateTime) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'LocalDateTime')
    return tmp
  }
  if (item instanceof types.LocalTime) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'LocalTime')
    return tmp
  }
  if (item instanceof types.Time) {
    const tmp = copyAndType(item, types)
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Time')
    return tmp
  }
  if (neo4j.isInt(item)) {
    const tmp = { ...item }
    safelyAddObjectProp(tmp, reservedTypePropertyName, 'Integer')
    return tmp
  }
  if (typeof item === 'object') {
    const typedObject: Record<string, any> = {}
    const localItem = escapeReservedProps(item, reservedTypePropertyName)
    Object.keys(localItem).forEach(key => {
      typedObject[key] = recursivelyTypeGraphItems(localItem[key], types)
    })
    return typedObject
  }
  return item
}

function copyAndType(any: any, types = neo4j.types) {
  const keys = Object.keys(any)
  const tmp: any = {}
  keys.forEach(key => (tmp[key] = recursivelyTypeGraphItems(any[key], types)))
  return tmp
}

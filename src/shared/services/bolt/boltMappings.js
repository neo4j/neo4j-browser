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
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import updateStatsFields from './updateStatisticsFields'
import { v1 as neo4j } from 'neo4j-driver-alias'

export function toObjects (records, converters) {
  const recordValues = records.map(record => {
    let out = []
    record.forEach((val, key) => out.push(itemIntToString(val, converters)))
    return out
  })
  return recordValues
}

export function recordsToTableArray (records, converters) {
  const recordValues = toObjects(records, converters)
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

export function itemIntToString (item, converters) {
  if (converters.intChecker(item)) return converters.intConverter(item)
  if (Array.isArray(item)) return arrayIntToString(item, converters)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (typeof item === 'object') return objIntToString(item, converters)
}

export function arrayIntToString (arr, converters) {
  return arr.map(item => itemIntToString(item, converters))
}

export function objIntToString (obj, converters) {
  let entry = converters.objectConverter(obj, converters)
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

export function extractFromNeoObjects (obj, converters) {
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
  return segments.map(function (segment) {
    return [
      objIntToString(segment.start, converters),
      objIntToString(segment.relationship, converters),
      objIntToString(segment.end, converters)
    ].filter(part => part !== null)
  })
}

export function extractPlan (result, calculateTotalDbHits = false) {
  if (result.summary && (result.summary.plan || result.summary.profile)) {
    const rawPlan = result.summary.profile || result.summary.plan
    const boltPlanToRESTPlanShared = plan => {
      return {
        operatorType: plan.operatorType,
        DbHits: plan.dbHits,
        Rows: plan.rows,
        identifiers: plan.identifiers,
        children: plan.children.map(_ => ({
          ..._.arguments,
          ...boltPlanToRESTPlanShared(_)
        }))
      }
    }
    let obj = { ...rawPlan.arguments, ...boltPlanToRESTPlanShared(rawPlan) }

    if (calculateTotalDbHits === true) {
      obj.totalDbHits = collectHits(obj)
    }

    return { root: obj }
  }
  return null
}

const collectHits = function (operator) {
  let hits = operator.DbHits || 0
  if (operator.children) {
    hits = operator.children.reduce((acc, subOperator) => {
      return acc + collectHits(subOperator)
    }, hits)
  }
  return hits
}

export function extractNodesAndRelationshipsFromRecords (records, types) {
  if (records.length === 0) {
    return { nodes: [], relationships: [] }
  }

  let keys = records[0].keys
  let rawNodes = []
  let rawRels = []
  records.forEach(record => {
    let graphItems = keys.map(key => record.get(key))
    rawNodes = [
      ...rawNodes,
      ...graphItems.filter(item => item instanceof types.Node)
    ]
    rawRels = [
      ...rawRels,
      ...graphItems.filter(item => item instanceof types.Relationship)
    ]
    let paths = graphItems.filter(item => item instanceof types.Path)
    paths.forEach(item =>
      extractNodesAndRelationshipsFromPath(item, rawNodes, rawRels, types)
    )
  })
  return { nodes: rawNodes, relationships: rawRels }
}

const resultContainsGraphKeys = keys => {
  return keys.includes('nodes') && keys.includes('relationships')
}

export function extractNodesAndRelationshipsFromRecordsForOldVis (
  records,
  types,
  filterRels,
  converters
) {
  if (records.length === 0) {
    return { nodes: [], relationships: [] }
  }
  let keys = records[0].keys
  let rawNodes = []
  let rawRels = []
  if (resultContainsGraphKeys(keys)) {
    rawNodes = [...rawNodes, ...records[0].get(keys[0])]
    rawRels = [...rawRels, ...records[0].get(keys[1])]
  } else {
    records.forEach(record => {
      let graphItems = keys.map(key => record.get(key))
      graphItems = flattenArray(
        recursivelyExtractGraphItems(types, graphItems)
      ).filter(item => item !== false)
      rawNodes = [
        ...rawNodes,
        ...graphItems.filter(item => item instanceof types.Node)
      ]
      rawRels = [
        ...rawRels,
        ...graphItems.filter(item => item instanceof types.Relationship)
      ]
      let paths = graphItems.filter(item => item instanceof types.Path)
      paths.forEach(item =>
        extractNodesAndRelationshipsFromPath(item, rawNodes, rawRels, types)
      )
    })
  }
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
  return { nodes: nodes, relationships: relationships }
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

export const flattenArray = arr => {
  return arr.reduce((all, curr) => {
    if (Array.isArray(curr)) return all.concat(flattenArray(curr))
    return all.concat(curr)
  }, [])
}

const extractNodesAndRelationshipsFromPath = (item, rawNodes, rawRels) => {
  let paths = Array.isArray(item) ? item : [item]
  paths.forEach(path => {
    let segments = path.segments
    // Zero length path. No relationship, end === start
    if (!Array.isArray(path.segments) || path.segments.length < 1) {
      segments = [{ ...path, end: null }]
    }
    segments.forEach(segment => {
      if (segment.start) rawNodes.push(segment.start)
      if (segment.end) rawNodes.push(segment.end)
      if (segment.relationship) rawRels.push(segment.relationship)
    })
  })
}

export const retrieveFormattedUpdateStatistics = result => {
  if (result.summary.counters) {
    const stats = result.summary.counters._stats
    const statsMessages = updateStatsFields
      .filter(field => stats[field.field] > 0)
      .map(
        field =>
          `${field.verb} ${stats[field.field]} ${stats[field.field] === 1
            ? field.singular
            : field.plural}`
      )
    return statsMessages.join(', ')
  } else return null
}

export const flattenProperties = rows => {
  return rows.map(row =>
    row.map(entry => (entry && entry.properties ? entry.properties : entry))
  )
}

export const applyGraphTypes = item => {
  if (item === null || item === undefined) {
    return item
  } else if (Array.isArray(item)) {
    return item.map(applyGraphTypes)
  } else if (
    item.hasOwnProperty('labels') &&
    item.hasOwnProperty('properties') &&
    item.hasOwnProperty('identity')
  ) {
    return new neo4j.types.Node(
      neo4j.int(item.identity),
      item.labels,
      applyGraphTypes(item.properties)
    )
  } else if (
    item.hasOwnProperty('segments') &&
    item.hasOwnProperty('start') &&
    item.hasOwnProperty('end')
  ) {
    const start = applyGraphTypes(item.start)
    const end = applyGraphTypes(item.end)
    const segments = item.segments.map(applyGraphTypes)
    return new neo4j.types.Path(start, end, segments)
  } else if (
    item.hasOwnProperty('relationship') &&
    item.hasOwnProperty('start') &&
    item.hasOwnProperty('end')
  ) {
    const start = applyGraphTypes(item.start)
    const end = applyGraphTypes(item.end)
    const relationship = applyGraphTypes(item.relationship)
    return new neo4j.types.PathSegment(start, relationship, end)
  } else if (
    item.hasOwnProperty('start') &&
    item.hasOwnProperty('end') &&
    item.hasOwnProperty('type')
  ) {
    return new neo4j.types.Relationship(
      neo4j.int(item.identity),
      neo4j.int(item.start),
      neo4j.int(item.end),
      item.type,
      applyGraphTypes(item.properties)
    )
  } else if (
    item.hasOwnProperty('low') &&
    item.hasOwnProperty('high') &&
    typeof item.low === 'number' &&
    typeof item.high === 'number'
  ) {
    return neo4j.int(item)
  } else if (typeof item === 'object') {
    let typedObject = {}
    Object.keys(item).forEach(key => {
      typedObject[key] = applyGraphTypes(item[key])
    })
    return typedObject
  } else {
    return item
  }
}

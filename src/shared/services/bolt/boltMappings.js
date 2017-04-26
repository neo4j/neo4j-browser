/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

export function toObjects (records, intChecker, intConverter) {
  const recordValues = records.map((record) => {
    let out = []
    record.forEach((val, key) => out.push(itemIntToString(val, intChecker, intConverter)))
    return out
  })
  return recordValues
}

export function recordsToTableArray (records, intChecker, intConverter) {
  const recordValues = toObjects(records, intChecker, intConverter)
  const keys = records[0].keys
  return [[...keys], ...recordValues]
}

export function itemIntToString (item, intChecker, intConverter) {
  if (intChecker(item)) return intConverter(item)
  if (Array.isArray(item)) return arrayIntToString(item, intChecker, intConverter)
  if (['number', 'string', 'boolean'].indexOf(typeof item) !== -1) return item
  if (item === null) return item
  if (typeof item === 'object') return objIntToString(item, intChecker, intConverter)
}

export function arrayIntToString (arr, intChecker, intConverter) {
  return arr.map((item) => itemIntToString(item, intChecker, intConverter))
}

export function objIntToString (obj, intChecker, intConverter) {
  let newObj = {}
  Object.keys(obj).forEach((key) => {
    newObj[key] = itemIntToString(obj[key], intChecker, intConverter)
  })
  return newObj
}

export function extractPlan (result) {
  if (result.summary && (result.summary.plan || result.summary.profile)) {
    const rawPlan = result.summary.profile || result.summary.plan
    const boltPlanToRESTPlanShared = (plan) => {
      return {
        operatorType: plan.operatorType,
        LegacyExpression: plan.arguments.LegacyExpression,
        ExpandExpression: plan.arguments.ExpandExpression,
        DbHits: plan.dbHits,
        Rows: plan.rows,
        EstimatedRows: plan.arguments.EstimatedRows,
        identifiers: plan.identifiers,
        Index: plan.arguments.Index,
        children: plan.children.map(boltPlanToRESTPlanShared)
      }
    }
    let obj = boltPlanToRESTPlanShared(rawPlan)
    obj['runtime-impl'] = rawPlan.arguments['runtime-impl']
    obj['planner-impl'] = rawPlan.arguments['planner-impl']
    obj['version'] = rawPlan.arguments['version']
    obj['KeyNames'] = rawPlan.arguments['KeyNames']
    obj['planner'] = rawPlan.arguments['planner']
    obj['runtime'] = rawPlan.arguments['runtime']
    return {root: obj}
  }
  return null
}

export function extractNodesAndRelationshipsFromRecords (records, types) {
  if (records.length === 0) {
    return { nodes: [], relationships: [] }
  }

  let keys = records[0].keys
  let rawNodes = []
  let rawRels = []
  records.forEach((record) => {
    let graphItems = keys.map((key) => record.get(key))
    rawNodes = [...rawNodes, ...graphItems.filter((item) => item instanceof types.Node)]
    rawRels = [...rawRels, ...graphItems.filter((item) => item instanceof types.Relationship)]
    let paths = graphItems.filter((item) => item instanceof types.Path)
    paths.forEach((item) => extractNodesAndRelationshipsFromPath(item, rawNodes, rawRels, types))
  })
  return { nodes: rawNodes, relationships: rawRels }
}

export function extractNodesAndRelationshipsFromRecordsForOldVis (records, types, filterRels, intChecker, intConverter) {
  if (records.length === 0) {
    return { nodes: [], relationships: [] }
  }
  let keys = records[0].keys
  let rawNodes = []
  let rawRels = []
  records.forEach((record) => {
    let graphItems = keys.map((key) => record.get(key))
    rawNodes = [...rawNodes, ...graphItems.filter((item) => item instanceof types.Node)]
    rawRels = [...rawRels, ...graphItems.filter((item) => item instanceof types.Relationship)]
    let paths = graphItems.filter((item) => item instanceof types.Path)
    paths.forEach((item) => extractNodesAndRelationshipsFromPath(item, rawNodes, rawRels, types))
  })
  const nodes = rawNodes.map((item) => {
    return {id: item.identity.toString(), labels: item.labels, properties: itemIntToString(item.properties, intChecker, intConverter)}
  })
  let relationships = rawRels
  if (filterRels) {
    relationships = rawRels.filter((item) => nodes.filter((node) => node.id === item.start.toString()).length > 0 && nodes.filter((node) => node.id === item.end.toString()).length > 0)
  }
  relationships = relationships.map((item) => {
    return {id: item.identity.toString(), startNodeId: item.start.toString(), endNodeId: item.end.toString(), type: item.type, properties: itemIntToString(item.properties, intChecker, intConverter)}
  })
  return { nodes: nodes, relationships: relationships }
}

const extractNodesAndRelationshipsFromPath = (item, rawNodes, rawRels) => {
  let paths = Array.isArray(item) ? item : [item]
  paths.forEach((path) => {
    path.segments.forEach((segment) => {
      rawNodes.push(segment.start)
      rawNodes.push(segment.end)
      rawRels.push(segment.relationship)
    })
  })
}

export const retrieveFormattedUpdateStatistics = (result) => {
  if (result.summary.counters) {
    const stats = result.summary.counters._stats
    const statsMessages = updateStatsFields.filter(field => stats[field.field] > 0).map(field => `${field.verb} ${stats[field.field]} ${stats[field.field] === 1 ? field.singular : field.plural}`)
    return statsMessages.join(', ')
  } else return null
}

export const flattenProperties = (rows) => {
  return rows.map((row) => row.map((entry) => (entry.properties) ? entry.properties : entry))
}

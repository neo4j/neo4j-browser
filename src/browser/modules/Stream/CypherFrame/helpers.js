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

import neo4j from 'neo4j-driver'
import {
  entries,
  flatten,
  filter,
  get,
  includes,
  isObjectLike,
  lowerCase,
  map,
  some,
  reduce,
  take
} from 'lodash-es'

import bolt from 'services/bolt/bolt'

import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import { recursivelyExtractGraphItems } from 'services/bolt/boltMappings'
import { stringifyMod } from 'services/utils'
import { stringModifier } from 'services/bolt/cypherTypesFormatting'

/**
 * Checks if a results has records which fields will be truncated when displayed
 * - O(N2) complexity
 * @param     {Object}    result
 * @param     {Number}    maxFieldItems
 * @return    {boolean}
 */
export const resultHasTruncatedFields = (result, maxFieldItems) => {
  if (!maxFieldItems || !result) {
    return false
  }

  return some(result.records, record =>
    some(record.keys, key => {
      const val = record.get(key)

      return Array.isArray(val) && val.length > maxFieldItems
    })
  )
}

export function getBodyAndStatusBarMessages(result, maxRows) {
  if (!result || !result.summary || !result.summary.resultAvailableAfter) {
    return {}
  }
  const resultAvailableAfter =
    result.summary.resultAvailableAfter.toNumber() === 0
      ? 'in less than 1'
      : `after ${result.summary.resultAvailableAfter.toString()}`
  const totalTime = result.summary.resultAvailableAfter.add(
    result.summary.resultConsumedAfter
  )
  const totalTimeString =
    totalTime.toNumber() === 0
      ? 'in less than 1'
      : `after ${totalTime.toString()}`
  const streamMessageTail =
    result.records.length > maxRows
      ? `ms, displaying first ${maxRows} rows.`
      : ' ms.'

  let updateMessages = bolt.retrieveFormattedUpdateStatistics(result)
  let streamMessage =
    result.records.length > 0
      ? `started streaming ${result.records.length} records ${resultAvailableAfter} ms and completed ${totalTimeString} ${streamMessageTail}`
      : `completed ${totalTimeString} ${streamMessageTail}`

  if (updateMessages && updateMessages.length > 0) {
    updateMessages = `${updateMessages[0].toUpperCase() +
      updateMessages.slice(1)}, `
  } else {
    streamMessage = streamMessage[0].toUpperCase() + streamMessage.slice(1)
  }

  const systemUpdatesValue = get(result, 'summary.counters._systemUpdates')
  const bodyMessage =
    (!updateMessages || updateMessages.length === 0) &&
    result.records.length === 0
      ? `(${(systemUpdatesValue > 0 &&
          `${systemUpdatesValue} system update${(systemUpdatesValue > 1 &&
            's') ||
            ''}`) ||
          'no changes'}, no records)`
      : `${updateMessages}completed ${totalTimeString} ms.`

  return {
    statusBarMessage: (updateMessages || '') + streamMessage,
    bodyMessage
  }
}

export const getRecordsToDisplayInTable = (result, maxRows) => {
  if (!result) return []
  return result && result.records && result.records.length > maxRows
    ? result.records.slice(0, maxRows)
    : result.records
}

export const flattenArrayDeep = arr => {
  let toFlatten = arr
  let result = []

  while (toFlatten.length > 0) {
    result = [...result, ...filter(toFlatten, item => !Array.isArray(item))]
    toFlatten = flatten(filter(toFlatten, Array.isArray))
  }

  return result
}

const VIS_MAX_SAFE_LIMIT = 1000

export const requestExceedsVisLimits = ({ result } = {}) => {
  return resultHasTruncatedFields(result, VIS_MAX_SAFE_LIMIT)
}

export const resultHasNodes = (request, types = neo4j.types) => {
  if (!request) return false
  const { result = {} } = request
  if (!result || !result.records) return false
  const { records = undefined } = result
  if (!records || !records.length) return false
  const keys = records[0].keys
  for (let i = 0; i < records.length; i++) {
    const graphItems = keys.map(key => records[i].get(key))
    const items = recursivelyExtractGraphItems(types, graphItems)
    const flat = flattenArrayDeep(items)
    const nodes = flat.filter(
      item => item instanceof types.Node || item instanceof types.Path
    )
    if (nodes.length) return true
  }
  return false
}

export const resultHasRows = request => {
  return !!(
    request &&
    request.result &&
    request.result.records &&
    request.result.records.length
  )
}

export const resultHasWarnings = request => {
  return !!(
    request &&
    request.result &&
    request.result.summary &&
    request.result.summary.notifications &&
    request.result.summary.notifications.length
  )
}

export const resultHasPlan = request => {
  return !!(
    request &&
    request.result &&
    request.result.summary &&
    !!(request.result.summary.plan || request.result.summary.profile)
  )
}

export const resultIsError = request => {
  return !!(request && request.result && request.result.code)
}

export const initialView = (props, state = {}) => {
  // Views that should override and always show if they exist
  if (
    props === undefined ||
    props.request === undefined ||
    props.request.status === 'pending'
  ) {
    return undefined
  }
  // If openView exists, this is not initial render
  if (props.request.status === 'error') return viewTypes.ERRORS
  if (state.openView !== undefined && state.openView !== viewTypes.ERRORS) {
    return state.openView
  }
  if (props.frame && props.frame.forceView) return props.frame.forceView
  if (resultHasPlan(props.request)) return viewTypes.PLAN
  if (!resultHasRows(props.request)) return viewTypes.TABLE

  // Non forced views
  // This get set when the user changes view in _any_ frame
  const { recentView = undefined } = props
  // We can only have three views here: TABLE, TEXT or VISUALIZATION
  // If TABLE or TEXT are recentView, fast return
  if ([viewTypes.TABLE, viewTypes.TEXT].indexOf(recentView) > -1) {
    return recentView
  }
  // No we don't care about the recentView
  // If the response have viz elements, we show the viz
  if (!requestExceedsVisLimits(props.request) && resultHasNodes(props.request))
    return viewTypes.VISUALIZATION
  return viewTypes.TABLE
}

/**
 * Takes an array of objects and stringifies it using a
 * modified version of JSON.stringify.
 * It takes a replacer without enforcing quoting rules to it.
 * Used so we can have Neo4j integers as string without quotes.
 */
export const stringifyResultArray = (formatter = stringModifier, arr = []) => {
  return arr.map(col => {
    if (!col) return col
    return col.map(fVal => {
      return stringifyMod(fVal, formatter)
    })
  })
}

/**
 * Transforms an array of neo4j driver records to an array of objects.
 * Flattens graph items so only their props are left.
 * Leaves Neo4j Integers as they were.
 */
export const transformResultRecordsToResultArray = (records, maxFieldItems) => {
  return records && records.length
    ? [records]
        .map(recs => extractRecordsToResultArray(recs, maxFieldItems))
        .flatMap(
          flattenGraphItemsInResultArray.bind(null, neo4j.types, neo4j.isInt)
        )
    : undefined
}

/**
 * Transforms an array of neo4j driver records to an array of objects.
 * Leaves all values as they were, just changing the data structure.
 */
export const extractRecordsToResultArray = (records = [], maxFieldItems) => {
  records = Array.isArray(records) ? records : []
  const keys = records[0] ? [records[0].keys] : undefined
  return (keys || []).concat(
    records.map(record => {
      return record.keys.map((key, i) => {
        const val = record._fields[i]

        if (!maxFieldItems || !Array.isArray(val)) {
          return val
        }

        return take(val, maxFieldItems)
      })
    })
  )
}

export const flattenGraphItemsInResultArray = (
  types = neo4j.types,
  intChecker = neo4j.isInt,
  result = []
) => {
  return result.map(flattenGraphItems.bind(null, types, intChecker))
}

/**
 * Recursively looks for graph items and elevates their properties if found.
 * Leaves everything else (including neo4j integers) as is
 */
export const flattenGraphItems = (
  types = neo4j.types,
  intChecker = neo4j.isInt,
  item
) => {
  if (Array.isArray(item)) {
    return item.map(flattenGraphItems.bind(null, types, intChecker))
  }
  if (
    typeof item === 'object' &&
    item !== null &&
    !isGraphItem(types, item) &&
    !intChecker(item)
  ) {
    const out = {}
    const keys = Object.keys(item)
    for (let i = 0; i < keys.length; i++) {
      out[keys[i]] = flattenGraphItems(types, intChecker, item[keys[i]])
    }
    return out
  }
  if (isGraphItem(types, item)) {
    return extractPropertiesFromGraphItems(types, item)
  }
  return item
}

export const isGraphItem = (types = neo4j.types, item) => {
  return (
    item instanceof types.Node ||
    item instanceof types.Relationship ||
    item instanceof types.Path ||
    item instanceof types.PathSegment ||
    item instanceof neo4j.types.Date ||
    item instanceof neo4j.types.DateTime ||
    item instanceof neo4j.types.Duration ||
    item instanceof neo4j.types.LocalDateTime ||
    item instanceof neo4j.types.LocalTime ||
    item instanceof neo4j.types.Time ||
    item instanceof neo4j.types.Point
  )
}

export function extractPropertiesFromGraphItems(types = neo4j.types, obj) {
  if (obj instanceof types.Node || obj instanceof types.Relationship) {
    return obj.properties
  } else if (obj instanceof types.Path) {
    return [].concat.apply([], arrayifyPath(types, obj))
  }
  return obj
}

const arrayifyPath = (types = neo4j.types, path) => {
  let segments = path.segments
  // Zero length path. No relationship, end === start
  if (!Array.isArray(path.segments) || path.segments.length < 1) {
    segments = [{ ...path, end: null }]
  }
  return segments.map(segment =>
    [
      extractPropertiesFromGraphItems(types, segment.start),
      extractPropertiesFromGraphItems(types, segment.relationship),
      extractPropertiesFromGraphItems(types, segment.end)
    ].filter(part => part !== null)
  )
}

/**
 * Converts a raw Neo4j record into a JSON friendly format, mimicking APOC output
 * @param     {Record}    record
 * @return    {*}
 */
export function recordToJSONMapper(record) {
  const keys = get(record, 'keys', [])

  return reduce(
    keys,
    (agg, key) => {
      const field = record.get(key)

      return {
        ...agg,
        [key]: mapNeo4jValuesToPlainValues(field)
      }
    },
    {}
  )
}

/**
 * Recursively converts Neo4j values to plain values, leaving other types untouched
 * @param     {*}     values
 * @return    {*}
 */
export function mapNeo4jValuesToPlainValues(values) {
  if (!isObjectLike(values)) {
    return values
  }

  if (Array.isArray(values)) {
    return map(values, mapNeo4jValuesToPlainValues)
  }

  if (isNeo4jValue(values)) {
    return neo4jValueToPlainValue(values)
  }

  // could be a Node or Relationship
  const elementType = lowerCase(get(values, 'constructor.name', ''))

  if (includes(['relationship', 'node'], elementType)) {
    return {
      elementType,
      ...mapNeo4jValuesToPlainValues({ ...values })
    }
  }

  return reduce(
    entries(values),
    (agg, [key, value]) => ({
      ...agg,
      [key]: mapNeo4jValuesToPlainValues(value)
    }),
    {}
  )
}

/**
 * Recursively convert Neo4j value to plain value, leaving other types untouched
 * @param     {*}   value
 * @return    {*}
 */
function neo4jValueToPlainValue(value) {
  switch (get(value, 'constructor')) {
    case neo4j.types.Date:
    case neo4j.types.DateTime:
    case neo4j.types.Duration:
    case neo4j.types.LocalDateTime:
    case neo4j.types.LocalTime:
    case neo4j.types.Time:
      return value.toString()
    case neo4j.types.Integer: // not exposed in typings but still there
      return value.inSafeRange() ? value.toInt() : value.toNumber()
    default:
      return value
  }
}

/**
 * checks if a value is a neo4j value
 * @param value
 * @return {boolean}
 */
function isNeo4jValue(value) {
  switch (get(value, 'constructor')) {
    case neo4j.types.Date:
    case neo4j.types.DateTime:
    case neo4j.types.Duration:
    case neo4j.types.LocalDateTime:
    case neo4j.types.LocalTime:
    case neo4j.types.Time:
    case neo4j.types.Integer: // not exposed in typings but still there
      return true
    default:
      return false
  }
}

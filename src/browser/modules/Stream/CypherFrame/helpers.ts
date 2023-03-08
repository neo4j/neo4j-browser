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
import {
  entries,
  filter,
  flatten,
  get,
  includes,
  isObjectLike,
  lowerCase,
  map,
  reduce,
  some
} from 'lodash-es'
import { CypherDataType, isCypherPropertyType } from 'neo4j-arc/common'
import neo4j, { Path, Record, Node, Relationship } from 'neo4j-driver'

import bolt from 'services/bolt/bolt'
import { recursivelyExtractGraphItems } from 'services/bolt/boltMappings'
import {
  durationFormat,
  stringModifier
} from 'services/bolt/cypherTypesFormatting'
import { stringifyMod, unescapeDoubleQuotesForDisplay } from 'services/utils'
import * as viewTypes from 'shared/modules/frames/frameViewTypes'
import { BrowserRequestResult } from 'shared/modules/requests/requestsDuck'

/**
 * Checks if a results has records which fields will be truncated when displayed
 * - O(N2) complexity
 * @param     {Object}    result
 * @param     {Number}    maxFieldItems
 * @return    {boolean}
 */
export const resultHasTruncatedFields = (result: any, maxFieldItems: any) => {
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

export function getBodyAndStatusBarMessages(
  result: any,
  maxRows: any
): { statusBarMessage?: string; bodyMessage?: string } {
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
    updateMessages = `${
      updateMessages[0].toUpperCase() + updateMessages.slice(1)
    }, `
  } else {
    streamMessage = streamMessage[0].toUpperCase() + streamMessage.slice(1)
  }

  const systemUpdatesValue = get(result, 'summary.counters._systemUpdates')
  const bodyMessage =
    (!updateMessages || updateMessages.length === 0) &&
    result.records.length === 0
      ? `(${
          (systemUpdatesValue > 0 &&
            `${systemUpdatesValue} system update${
              (systemUpdatesValue > 1 && 's') || ''
            }`) ||
          'no changes'
        }, no records)`
      : `${updateMessages}completed ${totalTimeString} ms.`

  return {
    statusBarMessage: (updateMessages || '') + streamMessage,
    bodyMessage
  }
}

export const getRecordsToDisplayInTable = (
  result: BrowserRequestResult,
  maxRows: number
): Record[] => {
  if (!result || !('records' in result)) return []
  return result && result.records && result.records.length > maxRows
    ? result.records.slice(0, maxRows)
    : result.records
}

export const flattenArrayDeep = (arr: any) => {
  let toFlatten = arr
  let result: any = []

  while (toFlatten.length > 0) {
    result = [...result, ...filter(toFlatten, item => !Array.isArray(item))]
    toFlatten = flatten(filter(toFlatten, Array.isArray))
  }

  return result
}

export const resultHasNodes = (request: any, types = neo4j.types) => {
  if (!request) return false
  const { result = {} } = request
  if (!result || !result.records) return false
  const { records = undefined } = result
  if (!records || !records.length) return false
  const keys = records[0].keys
  for (let i = 0; i < records.length; i++) {
    const graphItems = keys.map((key: any) => records[i].get(key))
    const items = recursivelyExtractGraphItems(types, graphItems)
    const flat: any[] = flattenArrayDeep(items)
    const nodes = flat.filter(
      item =>
        item instanceof (types.Node as any) ||
        item instanceof (types.Path as any)
    )
    if (nodes.length) return true
  }
  return false
}

export const resultHasRows = (request: any) => {
  return !!(
    request &&
    request.result &&
    request.result.records &&
    request.result.records.length
  )
}

export const resultHasWarnings = (request: any) => {
  return !!(
    request &&
    request.result &&
    request.result.summary &&
    request.result.summary.notifications &&
    request.result.summary.notifications.length
  )
}

export const resultHasPlan = (request: any) => {
  return !!(
    request &&
    request.result &&
    request.result.summary &&
    !!(request.result.summary.plan || request.result.summary.profile)
  )
}

export const resultIsError = (request: any) => {
  return !!(request && request.result && request.result.code)
}

export const initialView = (props: any, state: any = {}) => {
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
  if (resultHasNodes(props.request)) return viewTypes.VISUALIZATION
  return viewTypes.TABLE
}

/**
 * Takes an array of objects and stringifies it using a
 * modified version of JSON.stringify.
 * It takes a replacer without enforcing quoting rules to it.
 * Used so we can have Neo4j integers as string without quotes.
 */
export const stringifyResultArray = (
  formatter = stringModifier,
  arr: any[] = [],
  unescapeDoubleQuotes = false
) => {
  return arr.map(col => {
    if (!col) return col
    return col.map((fVal: any) => {
      const res = stringifyMod(fVal, formatter)
      return unescapeDoubleQuotes ? unescapeDoubleQuotesForDisplay(res) : res
    })
  })
}

/**
 * Recursively looks for graph items and elevates their properties if found.
 * Leaves everything else (including neo4j integers) as is
 */
export const flattenGraphItems = (
  types = neo4j.types,
  intChecker = neo4j.isInt,
  item: any
): any => {
  if (Array.isArray(item)) {
    return item.map(flattenGraphItems.bind(null, types, intChecker))
  }
  if (
    typeof item === 'object' &&
    item !== null &&
    !isGraphItem(types, item) &&
    !intChecker(item)
  ) {
    const out: any = {}
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

export const isGraphItem = (types = neo4j.types, item: any) => {
  return (
    item instanceof (types.Node as any) ||
    item instanceof (types.Relationship as any) ||
    item instanceof (types.Path as any) ||
    item instanceof (types.PathSegment as any) ||
    item instanceof neo4j.types.Date ||
    item instanceof neo4j.types.DateTime ||
    item instanceof neo4j.types.Duration ||
    item instanceof neo4j.types.LocalDateTime ||
    item instanceof neo4j.types.LocalTime ||
    item instanceof neo4j.types.Time ||
    item instanceof neo4j.types.Point
  )
}

export function extractPropertiesFromGraphItems(types = neo4j.types, obj: any) {
  if (
    obj instanceof (types.Node as any) ||
    obj instanceof (types.Relationship as any)
  ) {
    return obj.properties
  } else if (obj instanceof (types.Path as any)) {
    return [].concat.apply([], arrayifyPath(types, obj))
  }
  return obj
}

const arrayifyPath = (types = neo4j.types, path: any) => {
  let segments = path.segments
  // Zero length path. No relationship, end === start
  if (!Array.isArray(path.segments) || path.segments.length < 1) {
    segments = [{ ...path, end: null }]
  }
  return segments.map((segment: any) =>
    [
      extractPropertiesFromGraphItems(types, segment.start),
      extractPropertiesFromGraphItems(types, segment.relationship),
      extractPropertiesFromGraphItems(types, segment.end)
    ].filter(part => part !== null)
  )
}

/**
 * Converts a raw Neo4j record into a JSON friendly format, mimicking APOC output
 * Note: This preserves Neo4j integers as objects because they can't be guaranteed
 * to be converted to numbers and keeping the precision.
 * It's up to the serializer to identify them and write them as fake numbers (strings without quotes)
 * @param     {Record}    record
 * @return    {*}
 */
export function recordToJSONMapper(record: any) {
  const keys = get(record, 'keys', [])

  const recordObj = reduce(
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
  return recordObj
}

/**
 * Recursively converts Neo4j values to plain values, leaving other types untouched
 * @param     {*}     values
 * @return    {*}
 */
export function mapNeo4jValuesToPlainValues(values: any): any {
  if (neo4j.isInt(values)) {
    return values
  }

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
function neo4jValueToPlainValue(value: any) {
  switch (get(value, 'constructor')) {
    case neo4j.types.Duration:
      return durationFormat(value)
    case neo4j.types.Date:
    case neo4j.types.DateTime:
    case neo4j.types.LocalDateTime:
    case neo4j.types.LocalTime:
    case neo4j.types.Time:
      return value.toString()
    default:
      return value
  }
}

/**
 * checks if a value is a neo4j value
 * @param value
 * @return {boolean}
 */
function isNeo4jValue(value: any) {
  switch (get(value, 'constructor')) {
    case neo4j.types.Date:
    case neo4j.types.DateTime:
    case neo4j.types.Duration:
    case neo4j.types.LocalDateTime:
    case neo4j.types.LocalTime:
    case neo4j.types.Time:
      return true
    default:
      return false
  }
}

export const recordToStringArray = (record: Record): string[] => {
  const recursiveStringify = (value: CypherDataType): string => {
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]'
      return `[${value.map(v => recursiveStringify(v)).join(', ')}]`
    }

    if (isCypherPropertyType(value)) {
      //Note: later we should use propertyToString here but needs to be updated to show year in durations.
      return stringifyMod(value, stringModifier, true)
    }

    // We have nodes, relationships, paths and cypher maps left.
    const entries = Object.entries(value)
    if (entries.length === 0) return '{}'

    if (
      value instanceof Node ||
      value instanceof Relationship ||
      value instanceof Path
    ) {
      return stringifyNodeRelationshipOrPath(value)
    }

    //Else is cypher map
    const entriesString = entries
      .map(([key, value]) => {
        return `${key}: ${recursiveStringify(value)}`
      })
      .join(', ')

    return `{${entriesString}}`
  }

  const stringifyNodeRelationshipOrPath = (
    value: Node | Relationship | Path
  ): string => {
    if (value instanceof neo4j.types.Node) {
      const labels = value.labels.length > 0 ? `:${value.labels.join(':')}` : ''
      const properties = Object.entries(value.properties).map(
        ([key, value]) => {
          return `${key}: ${recursiveStringify(value)}`
        }
      )
      const propertiesString = properties.length > 0 ? `{${properties}}` : ''

      const space = labels.length > 0 && propertiesString.length > 0 ? ' ' : ''
      return `(${labels}${space}${propertiesString})`
    } else if (value instanceof neo4j.types.Relationship) {
      const type = value.type ? `:${value.type}` : ''

      const properties = Object.entries(value.properties).map(
        ([key, value]) => {
          return `${key}: ${recursiveStringify(value)}`
        }
      )
      const propertiesString = properties.length > 0 ? ` {${properties}}` : ''

      return `[${type}${propertiesString}]`
    } else {
      if (value.segments.length === 0) return recursiveStringify(value.start)

      return value.segments
        .map((segment, index) => {
          const result = []

          if (index === 0) {
            result.push(recursiveStringify(segment.start))
          }

          if (
            segment.start.elementId === segment.relationship.startNodeElementId
          ) {
            result.push('-')
            result.push(recursiveStringify(segment.relationship))
            result.push('->')
            result.push(recursiveStringify(segment.end))
          } else {
            result.push('<-')
            result.push(recursiveStringify(segment.relationship))
            result.push('-')
            result.push(recursiveStringify(segment.end))
          }

          return result.join('')
        })
        .join('')
    }
  }

  if (record.length === 0) return []
  return record.keys.map(key => recursiveStringify(record.get(key)))
}

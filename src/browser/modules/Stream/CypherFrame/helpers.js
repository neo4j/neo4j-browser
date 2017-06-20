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

import bolt from 'services/bolt/bolt'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import { recursivelyExtractGraphItems, flattenArray } from 'services/bolt/boltMappings'

export function getBodyAndStatusBarMessages (result, maxRows) {
  if (!result || !result.summary || !result.summary.resultAvailableAfter) {
    return {}
  }
  const resultAvailableAfter = (result.summary.resultAvailableAfter.toNumber() === 0) ? 'in less than 1' : 'after ' + result.summary.resultAvailableAfter.toString()
  const totalTime = result.summary.resultAvailableAfter.add(result.summary.resultConsumedAfter)
  const totalTimeString = (totalTime.toNumber() === 0) ? 'in less than 1' : 'after ' + totalTime.toString()
  const streamMessageTail = result.records.length > maxRows ? `ms, displaying first ${maxRows} rows.` : ' ms.'

  let updateMessages = bolt.retrieveFormattedUpdateStatistics(result)
  let streamMessage = result.records.length > 0
    ? `started streaming ${result.records.length} records ${resultAvailableAfter} ms and completed ${totalTimeString} ${streamMessageTail}`
    : `completed ${totalTimeString} ${streamMessageTail}`

  if (updateMessages && updateMessages.length > 0) {
    updateMessages = updateMessages[0].toUpperCase() + updateMessages.slice(1) + ', '
  } else {
    streamMessage = streamMessage[0].toUpperCase() + streamMessage.slice(1)
  }

  const bodyMessage = (updateMessages.length === 0 && result.records.length === 0) ? '(no changes, no records)'
    : updateMessages + `completed ${totalTimeString} ms.`

  return { statusBarMessage: updateMessages + streamMessage, bodyMessage }
}

export const getRecordsToDisplayInTable = (result, maxRows) => {
  if (!result) return []
  return result && result.records && result.records.length > maxRows
    ? result.records.slice(0, maxRows)
    : result.records
}

export const resultHasNodes = (request, types = bolt.neo4j.types) => {
  if (!request) return false
  const { result = {} } = request
  if (!result || !result.records) return false
  const { records = undefined } = result
  if (!records || !records.length) return false
  let keys = records[0].keys
  for (let i = 0; i < records.length; i++) {
    const graphItems = keys.map((key) => records[i].get(key))
    const items = recursivelyExtractGraphItems(types, graphItems)
    const flat = flattenArray(items)
    const nodes = flat.filter((item) => item instanceof types.Node || item instanceof types.Path)
    if (nodes.length) return true
  }
  return false
}

export const resultHasRows = (request) => {
  return !!(request && request.result && request.result.records && request.result.records.length)
}

export const resultHasWarnings = (request) => {
  return !!(
    request &&
    request.result &&
    request.result.summary &&
    request.result.summary.notifications &&
    request.result.summary.notifications.length
  )
}

export const resultHasPlan = (request) => {
  return !!(
    request &&
    request.result &&
    request.result.summary &&
    !!(request.result.summary.plan || request.result.summary.profile)
  )
}

export const resultIsError = (request) => {
  return !!(request && request.result && request.result.code)
}

export const initialView = (props, state = {}) => {
  // Views that should override and always show if they exist
  if (props === undefined || props.request === undefined || props.request.status === 'pending') return undefined
  if (state.openView !== undefined) return state.openView // If openView exists, this is not initial render
  if (props.frame && props.frame.forceView) return props.frame.forceView
  if (props.request.status === 'error') return viewTypes.ERRORS
  if (resultHasPlan(props.request)) return viewTypes.PLAN
  if (!resultHasRows(props.request)) return viewTypes.TABLE
  // Non forced views
  let { recentView = undefined } = props // This get set when the user changes view in _any_ frame
  if (recentView && recentView !== viewTypes.VISUALIZATION) return recentView
  if (resultHasNodes(props.request)) return viewTypes.VISUALIZATION
  return viewTypes.TABLE
}

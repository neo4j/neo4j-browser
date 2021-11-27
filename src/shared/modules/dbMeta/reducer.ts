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

import neo4j from 'neo4j-driver'

import {
  initialState,
  UPDATE,
  UPDATE_META,
  UPDATE_SERVER,
  UPDATE_SETTINGS,
  CLEAR
} from './constants'
import { APP_START } from 'shared/modules/app/appDuck'

function updateMetaForContext(state: any, meta: any, context: any) {
  if (!meta || !meta.records || !meta.records.length) {
    return {
      labels: initialState.labels,
      relationshipTypes: initialState.relationshipTypes,
      properties: initialState.properties,
      functions: initialState.functions,
      procedures: initialState.procedures,
      nodes: initialState.nodes,
      relationships: initialState.relationships
    }
  }
  const notInCurrentContext = (e: any) => e.context !== context
  const mapResult = (metaIndex: any, mapFunction: any) =>
    meta.records[metaIndex].get(0).data.map(mapFunction)
  const mapSingleValue = (r: any) => ({
    val: r,
    context
  })
  const mapInteger = (r: any) => (neo4j.isInt(r) ? r.toNumber() || 0 : r || 0)
  const mapInvocableValue = (r: any) => {
    const { name, signature, description } = r
    return {
      val: name,
      context,
      signature,
      description
    }
  }

  const compareMetaItems = (a: any, b: any) =>
    a.val < b.val ? -1 : a.val > b.val ? 1 : 0

  const labels = state.labels
    .filter(notInCurrentContext)
    .concat(mapResult(0, mapSingleValue))
    .sort(compareMetaItems)
  const relationshipTypes = state.relationshipTypes
    .filter(notInCurrentContext)
    .concat(mapResult(1, mapSingleValue))
    .sort(compareMetaItems)
  const properties = state.properties
    .filter(notInCurrentContext)
    .concat(mapResult(2, mapSingleValue))
    .sort(compareMetaItems)
  const functions = state.functions
    .filter(notInCurrentContext)
    .concat(mapResult(3, mapInvocableValue))
  const procedures = state.procedures
    .filter(notInCurrentContext)
    .concat(mapResult(4, mapInvocableValue))
  const nodes = meta.records[5]
    ? mapInteger(meta.records[5].get(0).data)
    : state.nodes
  const relationships = meta.records[6]
    ? mapInteger(meta.records[6].get(0).data)
    : state.relationships

  return {
    labels,
    relationshipTypes,
    properties,
    functions,
    procedures,
    nodes,
    relationships
  }
}

export default function meta(state = initialState, unalteredAction: any) {
  let action = unalteredAction
  if (unalteredAction && unalteredAction.settings) {
    const allowlist =
      unalteredAction.settings['browser.remote_content_hostname_allowlist'] ||
      unalteredAction.settings['browser.remote_content_hostname_whitelist']

    action = allowlist
      ? {
          ...unalteredAction,
          settings: {
            ...unalteredAction.settings,
            ['browser.remote_content_hostname_allowlist']: allowlist
          }
        }
      : unalteredAction
    delete action.settings['browser.remote_content_hostname_whitelist']
  }

  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state, serverConfigDone: false }
    case UPDATE:
      const { type, ...rest } = action
      return { ...state, ...rest }
    case UPDATE_META:
      return {
        ...state,
        ...updateMetaForContext(state, action.meta, action.context)
      }
    case UPDATE_SERVER:
      const { type: serverType, ...serverRest } = action
      const serverState: any = {}
      Object.keys(serverRest).forEach(key => {
        serverState[key] = action[key]
      })
      return {
        ...state,
        server: { ...state.server, ...serverState }
      }
    case UPDATE_SETTINGS:
      return { ...state, settings: { ...action.settings } }
    case CLEAR:
      return { ...initialState }
    default:
      return state
  }
}

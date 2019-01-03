/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

import Rx from 'rxjs/Rx'
import bolt from 'services/bolt/bolt'
import { toObjects, extractFromNeoObjects } from 'services/bolt/boltMappings'
import { APP_START } from 'shared/modules/app/appDuck'
import {
  CONNECTED_STATE,
  CONNECTION_SUCCESS,
  DISCONNECTION_SUCCESS,
  LOST_CONNECTION,
  UPDATE_CONNECTION_STATE,
  connectionLossFilter
} from 'shared/modules/connections/connectionsDuck'
import { FORCE_FETCH } from 'shared/modules/dbMeta/dbMetaDuck'
import { canSendTxMetadata } from 'shared/modules/features/featuresDuck'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'
import { getBackgroundTxMetadata } from 'shared/services/bolt/txMetadata'

export const NAME = 'jmx'
export const UPDATE = NAME + '/UPDATE'
export const UPDATE_JMX_VALUES = NAME + '/UPDATE_JMX_VALUES'

/**
 * Selectors
 */

export const getJmxValues = ({ jmx }, arr) => {
  return arr.map(([name, attribute = null]) => {
    if (!name) return null
    const part = jmx.find(entry => entry.name.includes(name))
    if (!part) return null
    const attributes = part.attributes
    if (!attribute) return attributes
    const key = attribute
    if (typeof attributes[key] === 'undefined') return null
    const val = bolt.itemIntToNumber(attributes[key].value)
    return { [key]: val }
  })
}

/**
 * Helpers
 */

const fetchJmxValues = store => {
  return bolt
    .directTransaction(
      'CALL dbms.queryJmx("org.neo4j:*")',
      {},
      {
        useCypherThread: shouldUseCypherThread(store.getState()),
        ...getBackgroundTxMetadata({
          hasServerSupport: canSendTxMetadata(store.getState())
        })
      }
    )
    .then(res => {
      const converters = {
        intChecker: bolt.neo4j.isInt,
        intConverter: val => val.toString(),
        objectConverter: extractFromNeoObjects
      }
      return toObjects(res.records, converters).map(
        ([name, description, attributes]) => {
          return {
            name,
            description,
            attributes
          }
        }
      )
    })
}

// Initial state
const initialState = []

/**
 * Reducer
 */
export default function jmx (state = initialState, action) {
  if (!action || action.type === APP_START) {
    return state
  }
  switch (action.type) {
    case UPDATE_JMX_VALUES:
      return [...action.values]
    default:
      return state
  }
}

// Actions
export const updateJmxValues = values => ({
  type: UPDATE_JMX_VALUES,
  values
})

// Epics

export const jmxEpic = (some$, store) =>
  some$
    .ofType(UPDATE_CONNECTION_STATE)
    .filter(s => s.state === CONNECTED_STATE)
    .merge(some$.ofType(CONNECTION_SUCCESS))
    .mergeMap(() => {
      return Rx.Observable.timer(0, 20000)
        .merge(some$.ofType(FORCE_FETCH))
        .mergeMap(() =>
          Rx.Observable.fromPromise(fetchJmxValues(store)).catch(e =>
            Rx.Observable.of(null)
          )
        )
        .filter(r => r)
        .do(res => store.dispatch(updateJmxValues(res)))
        .takeUntil(
          some$
            .ofType(LOST_CONNECTION)
            .filter(connectionLossFilter)
            .merge(some$.ofType(DISCONNECTION_SUCCESS))
        )
        .mapTo({ type: 'NOOP' })
    })

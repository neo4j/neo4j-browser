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

import { hydrate } from 'services/duckUtils'
import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'history'

export const ADD = 'history/ADD'
export const MAX_ENTRIES = 'history/MAX_ENTRIES'

// Selectors
export const getHistory = (state) => state[NAME].history

function addHistoryHelper (state, newState) {
  let newHistory = [].concat(state.history)
  newHistory.unshift(newState)
  return Object.assign({}, state, { history: newHistory.slice(0, state.maxHistory) })
}

// Reducer
const initialState = {history: [], maxHistory: 20}
export default function (state = initialState, action) {
  state = hydrate(initialState, state)

  switch (action.type) {
    case ADD:
      return addHistoryHelper(state, action.state)
    case MAX_ENTRIES:
      return Object.assign({}, state, { maxHistory: action.maxHistory })
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

// Actions
export const addHistory = (state) => {
  return {
    type: ADD,
    state: state
  }
}

export const setMaxHistory = (maxHistory) => {
  return {
    type: MAX_ENTRIES,
    maxHistory: maxHistory
  }
}

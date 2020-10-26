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

import { USER_CLEAR } from 'shared/modules/app/appDuck'

export const NAME = 'history'
export const ADD = 'history/ADD'
export const CLEAR = 'history/CLEAR'

// Selectors
export const getHistory = state => state[NAME]

function addHistoryHelper(state, newState, maxHistory) {
  // If it's the same as the last entry, don't add it
  if (state && state.length && state[0] === newState) {
    return state
  }
  const newHistory = [...state]
  newHistory.unshift(newState)
  return newHistory.slice(0, maxHistory)
}

// Reducer
const initialState = []
export default function(state = initialState, action) {
  switch (action.type) {
    case ADD:
      return addHistoryHelper(state, action.state, action.maxHistory)
    case CLEAR:
      return initialState
    case USER_CLEAR:
      return initialState
    default:
      return state
  }
}

// Actions
export const addHistory = (state, maxHistory) => {
  return {
    type: ADD,
    state,
    maxHistory
  }
}
export const clearHistory = () => {
  return {
    type: CLEAR
  }
}

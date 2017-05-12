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

export const NAME = 'params'
const MERGE = `${NAME}/MERGE`
const SET = `${NAME}/SET`

const initialState = {}

// Selectors
export const getParams = (state) => state[NAME]

// Reducer
export default function reducer (state = initialState, action) {
  state = hydrate(initialState, state)

  switch (action.type) {
    case MERGE:
      return {...state, ...action.params}
    case SET:
      return action.params
    default:
      return state
  }
}

// Action creators
export const merge = (obj) => {
  return {
    type: MERGE,
    params: obj
  }
}
export const set = (obj) => {
  return {
    type: SET,
    params: obj
  }
}

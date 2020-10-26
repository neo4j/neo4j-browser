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

import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'params'
const UPDATE = `${NAME}/UPDATE`
const REPLACE = `${NAME}/REPLACE`

const initialState = {}

// Selectors
export const getParams = state => state[NAME]

// Reducer
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case UPDATE:
      return { ...state, ...action.params }
    case REPLACE:
      return { ...action.params }
    default:
      return state
  }
}

// Action creators
export const update = obj => {
  return {
    type: UPDATE,
    params: obj
  }
}
export const replace = obj => {
  return {
    type: REPLACE,
    params: obj
  }
}

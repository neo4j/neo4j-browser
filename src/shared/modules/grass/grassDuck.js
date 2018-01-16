/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import { APP_START } from 'shared/modules/app/appDuck'

export const NAME = 'grass'
export const UPDATE_GRAPH_STYLE_DATA = 'grass/UPDATE_GRAPH_STYLE_DATA'
export const getGraphStyleData = state => state[NAME]

const initialState = null

function updateStyleData (state, styleData) {
  return styleData
}

export default function visualization (state = initialState, action) {
  if (action.type === APP_START) {
    state = !state ? state : { ...initialState, ...state }
  }

  switch (action.type) {
    case UPDATE_GRAPH_STYLE_DATA:
      return updateStyleData(state, action.styleData)
    default:
      return state
  }
}

export const updateGraphStyleData = graphStyleData => {
  return {
    type: UPDATE_GRAPH_STYLE_DATA,
    styleData: graphStyleData
  }
}

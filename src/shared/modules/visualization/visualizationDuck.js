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

export const NAME = 'visualization'
export const UPDATE_LABELS = 'visualization/UPDATE_LABELS'
export const UPDATE_GRAPH_STYLE_DATA = 'visualization/UPDATE_GRAPH_STYLE_DATA'

export const getLabels = (state) => state[NAME].labels
export const getGraphStyleData = state => state[NAME].styleData

const initialState = {
  labels: [],
  styleData: null
}

function updateLabelData (state, labels) {
  return Object.assign({}, state, {labels: labels})
}

function updateStyleData (state, styleData) {
  return Object.assign({}, state, {styleData: styleData})
}

export default function visualization (state = initialState, action) {
  switch (action.type) {
    case UPDATE_LABELS:
      return updateLabelData(state, action.labels)
    case UPDATE_GRAPH_STYLE_DATA:
      return updateStyleData(state, action.styleData)
    default:
      return state
  }
}

export const updateLabels = (labels) => {
  return {
    type: UPDATE_LABELS,
    labels: labels
  }
}

export const updateGraphStyleData = (graphStyleData) => {
  return {
    type: UPDATE_GRAPH_STYLE_DATA,
    styleData: graphStyleData
  }
}

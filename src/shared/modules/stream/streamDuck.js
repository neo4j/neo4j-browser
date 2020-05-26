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

import uuid from 'uuid'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mapTo'
import { moveInArray } from 'services/utils'
import { APP_START } from 'shared/modules/app/appDuck'
import { UPDATE as SETTINGS_UPDATE } from '../settings/settingsDuck'

export const NAME = 'frames'
export const ADD = 'frames/ADD'
export const REMOVE = 'frames/REMOVE'
export const CLEAR_ALL = 'frames/CLEAR_ALL'
export const FRAME_TYPE_FILTER_UPDATED = 'frames/FRAME_TYPE_FILTER_UPDATED'
export const PIN = `${NAME}/PIN`
export const UNPIN = `${NAME}/UNPIN`
export const SET_RECENT_VIEW = 'frames/SET_RECENT_VIEW'
export const SET_MAX_FRAMES = `${NAME}/SET_MAX_FRAMES`

/**
 * Selectors
 */
export function getFrame(state, id) {
  return state[NAME].byId[id]
}

export function getFrames(state) {
  return state[NAME].allIds.map(id => state[NAME].byId[id])
}

export function getFramesInContext(state, context) {
  return getFrames(state).filter(f => f.context === context)
}

export function getRecentView(state) {
  return state[NAME].recentView
}

/**
 * Reducer helpers
 */
function addFrame(state, newState) {
  if (newState.parentId && state.allIds.indexOf(newState.parentId) < 0) {
    // No parent
    return state
  }

  let frameObject = state.byId[newState.id] || { stack: [], isPinned: false }
  if (!newState.isRerun) {
    frameObject.stack.unshift(newState)
  } else {
    frameObject.stack = [newState]
  }
  let byId = {
    ...state.byId,
    [newState.id]: frameObject
  }
  let allIds = [].concat(state.allIds)

  if (newState.parentId) {
    const currentStatements = byId[newState.parentId].stack[0].statements || []
    // Need to add this id to parent's list of statements
    if (!currentStatements.includes(newState.id)) {
      byId = {
        ...byId,
        [newState.parentId]: {
          ...byId[newState.parentId],
          stack: [
            {
              ...byId[newState.parentId].stack[0],
              statements: currentStatements.concat(newState.id)
            }
          ]
        }
      }
    }
  } else {
    allIds = insertIntoAllIds(state, allIds, newState)
  }
  return ensureFrameLimit({
    ...state,
    allIds,
    byId
  })
}

function insertIntoAllIds(state, allIds, newState) {
  if (allIds.indexOf(newState.id) < 0) {
    // new frame
    const pos = findFirstFreePos(state)
    allIds.splice(pos, 0, newState.id)
  }
  return allIds
}

function removeFrame(state, id) {
  const byId = {
    ...state.byId
  }
  delete byId[id]
  const allIds = state.allIds.filter(fid => fid !== id)
  return {
    ...state,
    allIds,
    byId
  }
}

function pinFrame(state, id) {
  const pos = state.allIds.indexOf(id)
  const allIds = moveInArray(pos, 0, state.allIds) // immutable operation
  const byId = {
    ...state.byId
  }
  byId[id].isPinned = true
  return {
    ...state,
    allIds,
    byId
  }
}

function unpinFrame(state, id) {
  const currentPos = state.allIds.indexOf(id)
  const pos = findFirstFreePos(state)
  const allIds = moveInArray(currentPos, pos - 1, state.allIds) // immutable operation
  const byId = {
    ...state.byId
  }
  byId[id].isPinned = false
  return {
    ...state,
    allIds,
    byId
  }
}

function findFirstFreePos({ byId, allIds }) {
  let freePos = -1
  allIds.forEach((id, index) => {
    if (freePos > -1 || byId[id].isPinned) return
    freePos = index
  })
  return freePos === -1 ? allIds.length : freePos
}

function setRecentViewHelper(state, recentView) {
  return {
    ...state,
    recentView
  }
}

function ensureFrameLimit(state) {
  const limit = state.maxFrames || 1
  if (state.allIds.length <= limit) return state
  const numToRemove = state.allIds.length - limit
  const removeIds = state.allIds
    .slice(-1 * numToRemove)
    .filter(id => !state.byId[id].isPinned)
  const byId = { ...state.byId }
  removeIds.forEach(id => delete byId[id])
  return {
    ...state,
    allIds: state.allIds.slice(0, state.allIds.length - removeIds.length),
    byId
  }
}

/** Inital state */
export const initialState = {
  allIds: [],
  byId: {},
  recentView: null,
  maxFrames: 30
}

/**
 * Reducer
 */
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case APP_START:
      return { ...initialState, ...state }
    case ADD:
      return addFrame(state, action.state)
    case REMOVE:
      return removeFrame(state, action.id)
    case CLEAR_ALL:
      return { ...initialState }
    case PIN:
      return pinFrame(state, action.id)
    case UNPIN:
      return unpinFrame(state, action.id)
    case SET_RECENT_VIEW:
      return setRecentViewHelper(state, action.view)
    case SET_MAX_FRAMES:
      const newState = { ...state, maxFrames: action.maxFrames }
      return ensureFrameLimit(newState)
    default:
      return state
  }
}

// Action creators
export function add(payload) {
  return {
    type: ADD,
    state: {
      ...payload,
      id: payload.id || uuid.v1()
    }
  }
}

export function remove(id) {
  return {
    type: REMOVE,
    id
  }
}

export function clear() {
  return {
    type: CLEAR_ALL
  }
}

export function pin(id) {
  return {
    type: PIN,
    id
  }
}

export function unpin(id) {
  return {
    type: UNPIN,
    id
  }
}

export function setRecentView(view) {
  return {
    type: SET_RECENT_VIEW,
    view
  }
}

// Epics
export const maxFramesConfigEpic = (action$, store) =>
  action$
    .ofType(SETTINGS_UPDATE)
    .do(action => {
      const newMaxFrames = action.state.maxFrames
      if (!newMaxFrames) return
      store.dispatch({ type: SET_MAX_FRAMES, maxFrames: newMaxFrames })
    })
    .mapTo({ type: 'NOOP' })

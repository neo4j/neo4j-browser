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
import { Epic } from 'redux-observable'
import { Action } from 'redux'
import { FrameView } from 'shared/modules/stream/frameViewTypes'

export const NAME = 'frames'
export const ADD = 'frames/ADD'
export const REMOVE = 'frames/REMOVE'
export const CLEAR_ALL = 'frames/CLEAR_ALL'
export const FRAME_TYPE_FILTER_UPDATED = 'frames/FRAME_TYPE_FILTER_UPDATED'
export const PIN = 'frames/PIN'
export const UNPIN = 'frames/UNPIN'
export const SET_RECENT_VIEW = 'frames/SET_RECENT_VIEW'
export const SET_MAX_FRAMES = 'frames/SET_MAX_FRAMES'

export interface GlobalState {
  [NAME]: FramesState
  history: string[]
  [key: string]: Record<string, any>
}

export function getFrame(state: GlobalState, id: string): FrameStack {
  return state[NAME].byId[id]
}

export function getFrames(state: GlobalState): FrameStack[] {
  return state[NAME].allIds.map(id => state[NAME].byId[id])
}

export function getRecentView(state: GlobalState): null | FrameView {
  return state[NAME].recentView
}

/**
 * Reducer helpers
 */
function addFrame(state: FramesState, newState: Frame) {
  if (newState.parentId && state.allIds.indexOf(newState.parentId) < 0) {
    // No parent
    return state
  }

  const frameObject = state.byId[newState.id] || { stack: [], isPinned: false }
  if (!newState.isRerun) {
    frameObject.stack.unshift(newState)
  } else {
    frameObject.stack = [newState]
  }
  let byId = {
    ...state.byId,
    [newState.id]: frameObject
  }
  let allIds = [...state.allIds]

  if (newState.parentId) {
    const currentStatements = byId[newState.parentId].stack[0].statements || []
    // Need to add this id to parent's list of statements
    if (!currentStatements.includes(newState.id as any)) {
      byId = {
        ...byId,
        [newState.parentId]: {
          ...byId[newState.parentId],
          stack: [
            {
              ...byId[newState.parentId].stack[0],
              statements: currentStatements.concat(newState.id as any)
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

function insertIntoAllIds(
  state: FramesState,
  allIds: string[],
  newState: Frame
) {
  if (allIds.indexOf(newState.id as any) < 0) {
    // new frame
    const pos = findFirstFreePos(state)
    allIds.splice(pos, 0, newState.id as any)
  }
  return allIds
}

function removeFrame(state: FramesState, id: string) {
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

function pinFrame(state: FramesState, id: string): FramesState {
  const pos = state.allIds.indexOf(id)
  const allIds = moveInArray(pos, 0, state.allIds)
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

function unpinFrame(state: FramesState, id: string): FramesState {
  const currentPos = state.allIds.indexOf(id)
  const pos = findFirstFreePos(state)
  const allIds = moveInArray(currentPos, pos - 1, state.allIds)
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

function findFirstFreePos({ byId, allIds }: FramesState) {
  let freePos = -1
  allIds.forEach((id, index) => {
    if (freePos > -1 || byId[id].isPinned) return
    freePos = index
  })
  return freePos === -1 ? allIds.length : freePos
}

function setRecentViewHelper(state: FramesState, recentView: FrameView) {
  return {
    ...state,
    recentView
  }
}

function ensureFrameLimit(state: FramesState) {
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

interface ConnectionData {
  authEnabled: boolean
  authenticatedMethod: string
  db: null
  host: string
  id: string
  name: string
  password: string
  type: string
  username: string
}

interface FrameError {
  cmd: string
  code: string
  message: string
  type: string
}

// When more code is typed, frame should be a union type of different frames
export interface Frame {
  autoCommit: boolean
  cmd: string
  connectionData: ConnectionData
  error: FrameError
  id: string
  initialSlide: number
  isRerun: boolean
  parentId: string
  query: string
  result: string
  requestId: string
  statements: string[]
  ts: number
  type: string
  useDb: string | null
}

interface FrameStack {
  stack: Frame[]
  isPinned: boolean
}

interface FramesState {
  allIds: string[]
  byId: { [key: string]: FrameStack }
  recentView: null | FrameView
  maxFrames: number
}

export const initialState: FramesState = {
  allIds: [],
  byId: {},
  recentView: null,
  maxFrames: 30
}

export default function reducer(
  state = initialState,
  action: StreamActions
): FramesState {
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
      const newState = {
        ...state,
        maxFrames: action.maxFrames
      }
      return ensureFrameLimit(newState)
    default:
      return state
  }
}

interface AddFrameAction {
  type: typeof ADD
  state: Frame
}

export function add(payload: Frame): AddFrameAction {
  return {
    type: ADD,
    state: {
      ...payload,
      id: payload.id || uuid.v1()
    }
  }
}

interface RemoveFrameAction {
  type: typeof REMOVE
  id: string
}

export function remove(id: string): RemoveFrameAction {
  return {
    type: REMOVE,
    id
  }
}

interface ClearFramesAction {
  type: typeof CLEAR_ALL
}

export function clear(): ClearFramesAction {
  return {
    type: CLEAR_ALL
  }
}

interface PinFrameAction {
  type: typeof PIN
  id: string
}

export function pin(id: string): PinFrameAction {
  return {
    type: PIN,
    id
  }
}

interface UnpinFrameAction {
  type: typeof UNPIN
  id: string
}

export function unpin(id: string): UnpinFrameAction {
  return {
    type: UNPIN,
    id
  }
}

interface SetRecentViewAction {
  type: typeof SET_RECENT_VIEW
  view: FrameView
}

export function setRecentView(view: FrameView): SetRecentViewAction {
  return {
    type: SET_RECENT_VIEW,
    view
  }
}

interface SetMaxFramesAction {
  type: typeof SET_MAX_FRAMES
  maxFrames: number
}

type StreamActions =
  | AddFrameAction
  | RemoveFrameAction
  | ClearFramesAction
  | PinFrameAction
  | UnpinFrameAction
  | SetRecentViewAction
  | SetMaxFramesAction

interface SettingsUpdateAction {
  type: typeof SETTINGS_UPDATE
  state: { maxFrames: number }
}

// Epics
export const maxFramesConfigEpic: Epic<Action, GlobalState> = (
  action$,
  store
) =>
  action$
    .ofType(SETTINGS_UPDATE)
    .do(action => {
      const newMaxFrames = (action as SettingsUpdateAction).state.maxFrames
      if (!newMaxFrames) return
      store.dispatch({
        type: SET_MAX_FRAMES,
        maxFrames: newMaxFrames
      } as SetMaxFramesAction)
    })
    .mapTo({ type: 'NOOP' })

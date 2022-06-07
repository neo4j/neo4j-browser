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
import { Action } from 'redux'
import { Epic } from 'redux-observable'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/mapTo'
import uuid from 'uuid'

import { Database } from '../dbMeta/dbMetaDuck'
import {
  UPDATE as SETTINGS_UPDATE,
  getMaxFrames,
  initialState as settingsDefaultState
} from '../settings/settingsDuck'
import { moveInArray } from 'services/utils'
import { GlobalState } from 'shared/globalState'
import { APP_START, AppStartAction } from 'shared/modules/app/appDuck'
import { FrameView } from 'shared/modules/frames/frameViewTypes'

export const NAME = 'frames'
export const ADD = 'frames/ADD'
export const REMOVE = 'frames/REMOVE'
export const CLEAR_ALL = 'frames/CLEAR_ALL'
export const PIN = 'frames/PIN'
export const UNPIN = 'frames/UNPIN'
export const SET_RECENT_VIEW = 'frames/SET_RECENT_VIEW'
export const ENSURE_MAX_FRAMES = 'frames/ENSURE_MAX_FRAMES'
export const TRACK_SAVE_AS_PROJECT_FILE = 'frames/TRACK_SAVE_AS_PROJECT_FILE'
export const TRACK_FULLSCREEN_TOGGLE = 'frames/TRACK_FULLSCREEN_TOGGLE'
export const TRACK_COLLAPSE_TOGGLE = 'frames/TRACK_COLLAPSE_TOGGLE'
export const SET_NODE_PROPERTIES_COLLAPSED_BY_DEFAULT =
  'frames/SET_NODE_PROPERTIES_COLLAPSED_BY_DEFAULT'

export function getFrame(state: GlobalState, id: string): FrameStack {
  return state[NAME].byId[id]
}

export function getFrames(state: GlobalState): FrameStack[] {
  return state[NAME].allIds.map(id => state[NAME].byId[id])
}

export function getRecentView(state: GlobalState): null | FrameView {
  return state[NAME].recentView
}

export function getNodePropertiesExpandedByDefault(
  state: GlobalState
): boolean {
  return (
    state[NAME].nodePropertiesExpandedByDefault ??
    initialState.nodePropertiesExpandedByDefault
  )
}

/**
 * Reducer helpers
 */
function addFrame(state: FramesState, newState: Frame) {
  if (newState.parentId && state.allIds.indexOf(newState.parentId) < 0) {
    // Can't find parent
    return state
  }

  const frameObject = state.byId[newState.id] || { stack: [], isPinned: false }
  const pastHistory = frameObject.stack[0]?.history || []
  const createNewHistoryEntry = newState.cmd !== pastHistory[0]

  const newFrame = {
    ...newState,
    history: createNewHistoryEntry
      ? [newState.cmd, ...pastHistory]
      : pastHistory
  }
  if (newState.isRerun) {
    frameObject.stack = [newFrame]
  } else {
    frameObject.stack.unshift(newFrame)
  }
  let byId = {
    ...state.byId,
    [newState.id]: frameObject
  }
  let allIds = [...state.allIds]

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
  return {
    ...state,
    allIds,
    byId
  }
}

function insertIntoAllIds(
  state: FramesState,
  allIds: string[],
  newState: Frame
) {
  if (allIds.indexOf(newState.id) < 0) {
    // new frame
    const pos = findFirstFreePos(state)
    allIds.splice(pos, 0, newState.id)
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

function ensureFrameLimit(state: FramesState, maxFrames: number) {
  const defaultMax =
    typeof settingsDefaultState.maxFrames === 'number'
      ? settingsDefaultState.maxFrames
      : parseInt(settingsDefaultState.maxFrames, 10)

  const limit = maxFrames >= 1 ? Math.floor(maxFrames) : defaultMax
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

export interface FrameError {
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
  history?: string[]
  dbs?: Database[]
}

export interface FrameStack {
  stack: Frame[]
  isPinned: boolean
}

export interface FramesState {
  allIds: string[]
  byId: { [key: string]: FrameStack }
  recentView: null | FrameView
  nodePropertiesExpandedByDefault: boolean
}

export const initialState: FramesState = {
  allIds: [],
  byId: {},
  recentView: null,
  nodePropertiesExpandedByDefault: true
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
    case ENSURE_MAX_FRAMES:
      return ensureFrameLimit(state, action.maxFrames)
    case CLEAR_ALL:
      return { ...initialState }
    case PIN:
      return pinFrame(state, action.id)
    case UNPIN:
      return unpinFrame(state, action.id)
    case SET_RECENT_VIEW:
      return setRecentViewHelper(state, action.view)
    case SET_NODE_PROPERTIES_COLLAPSED_BY_DEFAULT:
      return {
        ...state,
        nodePropertiesExpandedByDefault: action.expandedByDefault
      }
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

export interface SetRecentViewAction {
  type: typeof SET_RECENT_VIEW
  view: FrameView
}

export function setRecentView(view: FrameView): SetRecentViewAction {
  return {
    type: SET_RECENT_VIEW,
    view
  }
}
export interface SetExpandedByDefaultAction {
  type: typeof SET_NODE_PROPERTIES_COLLAPSED_BY_DEFAULT
  expandedByDefault: boolean
}

export function setNodePropertiesExpandedByDefault(
  expandedByDefault: boolean
): SetExpandedByDefaultAction {
  return {
    type: SET_NODE_PROPERTIES_COLLAPSED_BY_DEFAULT,
    expandedByDefault
  }
}

export interface EnsureMaxFramesAction {
  type: typeof ENSURE_MAX_FRAMES
  maxFrames: number
}

type StreamActions =
  | AppStartAction
  | AddFrameAction
  | RemoveFrameAction
  | ClearFramesAction
  | PinFrameAction
  | UnpinFrameAction
  | SetRecentViewAction
  | EnsureMaxFramesAction
  | SetExpandedByDefaultAction

// Epics
export const ensureMaxFramesEpic: Epic<Action, GlobalState> = (
  action$,
  store
) =>
  action$.ofType(SETTINGS_UPDATE, ADD).map(() => {
    const maxFrames = getMaxFrames(store.getState())
    const maxFramesAction: EnsureMaxFramesAction = {
      type: ENSURE_MAX_FRAMES,
      maxFrames
    }
    return maxFramesAction
  })

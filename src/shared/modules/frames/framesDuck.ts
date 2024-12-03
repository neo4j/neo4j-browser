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
import { createSlice } from '@reduxjs/toolkit'
import { GlobalState } from 'shared/globalState'
import { FrameView } from 'shared/modules/frames/frameViewTypes'
import { getMaxFrames } from '../settings/settingsDuck'
import { v4 as uuid } from 'uuid'

// Types
export interface Frame {
  id: string
  isPinned: boolean
  content: string
  ts: number
  isRerun: boolean
  useDb: string | null
  type: string
  cmd: string
  result?: any
  // Add other frame properties as needed
}

interface FramesState {
  allIds: string[]
  byId: Record<string, Frame>
  recentView: null | FrameView
  nodePropertiesCollapsedByDefault: boolean
}

const initialState: FramesState = {
  allIds: [],
  byId: {},
  recentView: null,
  nodePropertiesCollapsedByDefault: false
}

// Action Types
export const NAME = 'frames'

// Slice
const framesSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    add: (state, action: { payload: Frame }) => {
      const frame = {
        ...action.payload,
        id: action.payload.id || uuid()
      }
      state.byId[frame.id] = frame
      state.allIds.push(frame.id)
    },
    remove: (state, action: { payload: string }) => {
      const id = action.payload
      delete state.byId[id]
      state.allIds = state.allIds.filter(frameId => frameId !== id)
    },
    clearAll: (state) => {
      state.allIds = []
      state.byId = {}
      state.recentView = null
    },
    pin: (state, action: { payload: string }) => {
      const id = action.payload
      if (state.byId[id]) {
        state.byId[id].isPinned = true
      }
    },
    unpin: (state, action: { payload: string }) => {
      const id = action.payload
      if (state.byId[id]) {
        state.byId[id].isPinned = false
      }
    },
    setRecentView: (state, action: { payload: FrameView | null }) => {
      state.recentView = action.payload
    },
    ensureMaxFrames: (state, action) => {
      const maxFrames = getMaxFrames(action.payload)
      while (state.allIds.length > maxFrames) {
        const id = state.allIds[0]
        if (!state.byId[id].isPinned) {
          state.allIds.shift()
          delete state.byId[id]
        }
      }
    }
  }
})

export const { add, remove, clearAll, pin, unpin, setRecentView } = framesSlice.actions
export default framesSlice.reducer

// Selectors
export const getFrame = (state: GlobalState, id: string) => state[NAME].byId[id]
export const getFrames = (state: GlobalState) => state[NAME].allIds.map((id: string) => state[NAME].byId[id])
export const getRecentView = (state: GlobalState) => state[NAME].recentView

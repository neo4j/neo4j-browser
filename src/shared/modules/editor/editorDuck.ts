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
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getUrlParamValue } from 'services/utils'

// Action Types
export const NAME = 'editor'
export const SET_CONTENT = 'editor/SET_CONTENT'
export const EDIT_CONTENT = 'editor/EDIT_CONTENT'
export const FOCUS = 'editor/FOCUS'
export const EXPAND = 'editor/EXPAND'
export const EDITOR_CONTENT_CHANGE = 'editor/CONTENT_CHANGE'
export const APP_START = 'APP_START'
export const URL_ARGUMENTS_CHANGE = 'URL_ARGUMENTS_CHANGE'
export const NOT_SUPPORTED_URL_PARAM_COMMAND = 'editor/NOT_SUPPORTED_URL_PARAM_COMMAND'

// Supported commands
const validCommandTypes: { [key: string]: (args: string[]) => string } = {
  play: args => `:play ${args.join(' ')}`,
  guide: args => `:guide ${args.join(' ')}`,
  edit: args => args.join('\n'),
  param: args => `:param ${args.join(' ')}`,
  params: args => `:params ${args.join(' ')}`
}

interface EditorState {
  content: string
  error: string | null
  expanded: boolean
  focused: boolean
  id: string
  name: string | null
  isProjectFile: boolean
  isStatic: boolean
  directory: string | null
}

const initialState: EditorState = {
  content: '',
  error: null,
  expanded: false,
  focused: false,
  id: '',
  name: null,
  isProjectFile: false,
  isStatic: false,
  directory: null
}

// Thunks
export const populateEditorFromUrl = createAsyncThunk(
  'editor/populateFromUrl',
  async (url: string) => {
    const cmdParam = getUrlParamValue('cmd', url)
    
    if (!cmdParam || !Array.isArray(cmdParam) || cmdParam.length === 0) {
      return null
    }

    const command = cmdParam[0]
    if (!Object.keys(validCommandTypes).includes(command)) {
      throw new Error(`Not supported command: ${command}`)
    }

    const commandType = cmdParam[0]
    const cmdArgs = getUrlParamValue(
      'arg',
      decodeURIComponent(url.replace(/\+/g, ' '))
    ) || []
    
    return validCommandTypes[commandType](cmdArgs)
  }
)

// Slice
const editorSlice = createSlice({
  name: NAME,
  initialState,
  reducers: {
    setContent: (state, action: PayloadAction<string>) => {
      state.content = action.payload
    },
    editContent: (state, action: PayloadAction<{
      id?: string
      message: string
      name?: string | null
      isStatic?: boolean
      isProjectFile?: boolean
    }>) => {
      const { id = '', message, name = null, isStatic = false, isProjectFile = false } = action.payload
      state.content = message
      state.id = id
      state.name = name
      state.isStatic = isStatic
      state.isProjectFile = isProjectFile
    },
    focus: (state) => {
      state.focused = true
    },
    blur: (state) => {
      state.focused = false
    },
    expand: (state) => {
      state.expanded = true
    },
    contract: (state) => {
      state.expanded = false
    }
  },
  extraReducers: builder => {
    builder
      .addCase(populateEditorFromUrl.fulfilled, (state, action) => {
        if (action.payload) {
          state.content = action.payload
        }
      })
      .addCase(populateEditorFromUrl.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to populate editor'
      })
  }
})

export const { setContent, editContent, focus, blur, expand, contract } = editorSlice.actions
export default editorSlice.reducer

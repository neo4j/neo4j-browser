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
import { GlobalState } from 'shared/globalState'

export const NAME = 'sidebar'

export const TOGGLE = 'sidebar/TOGGLE'
export const OPEN = 'sidebar/OPEN'
export const SET_DRAFT_SCRIPT = 'sidebar/SET_DRAFT_SCRIPT'
export const TRACK_CANNY_CHANGELOG = 'sidebar/CANNY_CHANGELOG_OPENED'
export const TRACK_CANNY_FEATURE_REQUEST =
  'sidebar/CANNY_FEATURE_REQUEST_OPENED'

export function getOpenDrawer(state: GlobalState): string | null {
  return state[NAME].drawer
}

export function getCurrentDraft(state: GlobalState): string | null {
  return state[NAME].draftScript
}

export function getScriptDraftId(state: GlobalState): string | null {
  return state[NAME].scriptId || null
}

export const GUIDE_DRAWER_ID = 'guides'

// SIDEBAR
type DrawerId =
  | 'dbms'
  | 'db'
  | 'documents'
  | 'sync'
  | 'favorites'
  | 'about'
  | 'project files'
  | 'settings'
  | typeof GUIDE_DRAWER_ID
  | null
export interface SidebarState {
  drawer: DrawerId | null
  draftScript: string | null
  scriptId: string | null
}
const initialState: SidebarState = {
  drawer: null,
  draftScript: null,
  scriptId: null
}

function toggleDrawer(state: SidebarState, drawer: DrawerId): SidebarState {
  // When toggling the drawer we clear the script draft
  if (drawer === state.drawer) {
    return { draftScript: null, drawer: null, scriptId: null }
  }
  return { draftScript: null, drawer, scriptId: null }
}

type SidebarAction = ToggleAction | SetDraftScriptAction | OpenSidebarAction

interface ToggleAction {
  type: typeof TOGGLE
  drawerId: DrawerId
}

export interface OpenSidebarAction {
  type: typeof OPEN
  drawerId: DrawerId
}

export interface SetDraftScriptAction {
  type: typeof SET_DRAFT_SCRIPT
  cmd: string | null
  scriptId: string | null
  drawerId: DrawerId
}

export default function reducer(
  state = initialState,
  action: SidebarAction
): SidebarState {
  switch (action.type) {
    case TOGGLE:
      return toggleDrawer(state, action.drawerId)
    case OPEN:
      return { ...state, drawer: action.drawerId }
    case SET_DRAFT_SCRIPT:
      return {
        drawer: action.drawerId,
        scriptId: action.scriptId,
        draftScript: action.cmd
      }
  }
  return state
}

export function toggle(drawerId: DrawerId): ToggleAction {
  return { type: TOGGLE, drawerId }
}

export function open(drawerId: DrawerId): OpenSidebarAction {
  return { type: OPEN, drawerId }
}

export function setDraftScript(
  cmd: string | null,
  drawerId: DrawerId,
  scriptId: string | null = null
): SetDraftScriptAction {
  return { type: SET_DRAFT_SCRIPT, cmd, drawerId, scriptId }
}

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
export const SET_DRAFT_SCRIPT = 'sidebar/SET_DRAFT_SCRIPT'

export function getOpenDrawer(state: GlobalState): string | null {
  return state[NAME].drawer
}

export function getCurrentDraft(state: GlobalState): string | null {
  return state[NAME].draftScript
}

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
  | null
export interface SidebarState {
  drawer: DrawerId | null
  draftScript: string | null
}
const initialState: SidebarState = {
  drawer: null,
  draftScript: null
}

function toggleDrawer(state: SidebarState, drawer: DrawerId): SidebarState {
  // When toggling the drawer we clear the script draft
  if (drawer === state.drawer) {
    return { draftScript: null, drawer: null }
  }
  return { draftScript: null, drawer }
}

type SidebarAction = ToggleAction | SetDraftScriptAction

interface ToggleAction {
  type: typeof TOGGLE
  drawerId: DrawerId
}

interface SetDraftScriptAction {
  type: typeof SET_DRAFT_SCRIPT
  cmd: string | null
  drawerId: DrawerId
}

export default function reducer(
  state = initialState,
  action: SidebarAction
): SidebarState {
  switch (action.type) {
    case TOGGLE:
      return toggleDrawer(state, action.drawerId)
    case SET_DRAFT_SCRIPT:
      return { drawer: action.drawerId, draftScript: action.cmd }
  }
  return state
}

export function toggle(drawerId: DrawerId): ToggleAction {
  return { type: TOGGLE, drawerId }
}

export function setDraftScript(
  cmd: string | null,
  drawerId: DrawerId
): SetDraftScriptAction {
  return { type: SET_DRAFT_SCRIPT, cmd, drawerId }
}

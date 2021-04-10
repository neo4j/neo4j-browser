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

export const NAME = 'guides'
export const START_GUIDE = 'sidebar/START_GUIDE'

export const getGuide = (state: GlobalState): Guide | null => state[NAME].guide
// Todo the refactor I want is for this to include
// everything needed to show the guide not this
// half measure
export type Guide = {
  initialSlide: number
  guideName: string
  slides: JSX.Element[]
}

export interface GuideState {
  guide: Guide | null
}
const initialState: GuideState = {
  guide: null
}

type GuideAction = StartAction

interface StartAction {
  type: typeof START_GUIDE
  guide: Guide
}

export default function reducer(
  state = initialState,
  action: GuideAction
): GuideState {
  switch (action.type) {
    case START_GUIDE:
      return { ...state, guide: action.guide }
    default:
      return state
  }
}

export function startGuide(guide: Guide): StartAction {
  return { type: START_GUIDE, guide }
}

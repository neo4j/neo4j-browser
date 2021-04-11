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

import docs from 'browser/documentation'
import { GlobalState } from 'shared/globalState'

export const NAME = 'guides'
export const START_GUIDE = 'sidebar/START_GUIDE'

export const getGuide = (state: GlobalState): Guide => state[NAME].guide
export type Guide = {
  initialSlide: number
  title: string
  slides: JSX.Element[]
}

const defaultGuide: Guide = {
  title: 'allGuides',
  initialSlide: 0,
  slides: docs.play.chapters.allGuides.slides || []
}
export interface GuideState {
  guide: Guide
}
const initialState: GuideState = {
  guide: defaultGuide
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

export function startGuide(guide: Guide = defaultGuide): StartAction {
  return { type: START_GUIDE, guide }
}

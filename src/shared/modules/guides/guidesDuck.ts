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

import { Observable } from 'rxjs'
import { Epic } from 'redux-observable'
import docs from 'browser/documentation'
import { GlobalState } from 'shared/globalState'
import { tryGetRemoteInitialSlideFromUrl } from 'services/commandUtils'
import { resolveGuide } from '../../services/guideResolverHelper'
import { OpenAction, open } from '../sidebar/sidebarDuck'

export const NAME = 'guides'
export const FETCH_GUIDE = 'guides/FETCH_GUIDE'
export const SET_GUIDE = 'sidebar/SET_GUIDE'
export const GOTO_SLIDE = 'sidebar/GOTO_SLIDE'
export const UPDATE_REMOTE_GUIDES = 'sidebar/UPDATE_REMOTE_GUIDES'
export const ADD_GUIDE = 'sidebar/ADD_GUIDE'

export const getCurrentGuide = (state: GlobalState): Guide | null =>
  state[NAME].currentGuide
export const getRemoteGuides = (state: GlobalState): Guide[] =>
  state[NAME].remoteGuides

export type Guide = {
  currentSlide: number
  title: string
  identifier: string
  slides?: JSX.Element[]
}

export interface GuideState {
  currentGuide: Guide | null
  remoteGuides: Guide[]
}

const initialState: GuideState = {
  currentGuide: null,
  remoteGuides: []
}

export type GuideAction =
  | FetchGuideAction
  | SetGuideAction
  | GotoSlideAction
  | UpdateGuideAction
  | AddGuideAction

export interface SetGuideAction {
  type: typeof SET_GUIDE
  guide: Guide | null
}

export interface GotoSlideAction {
  type: typeof GOTO_SLIDE
  slideIndex: number
}

export interface FetchGuideAction {
  type: typeof FETCH_GUIDE
  identifier: string
}

export interface UpdateGuideAction {
  type: typeof UPDATE_REMOTE_GUIDES
  updatedGuides: Guide[]
}
interface AddGuideAction {
  type: typeof ADD_GUIDE
  guide: Guide
}

export const fetchRemoteGuideEpic: Epic<
  FetchGuideAction | SetGuideAction | OpenAction | AddGuideAction,
  GlobalState
> = (action$, store$) =>
  action$.ofType(FETCH_GUIDE).flatMap(action => {
    const initialSlide = tryGetRemoteInitialSlideFromUrl(
      (<FetchGuideAction>action).identifier
    )
    return Observable.fromPromise(
      resolveGuide((<FetchGuideAction>action).identifier, store$.getState())
    ).mergeMap(({ title, identifier, slides, isError }) => {
      const guide: Guide = {
        currentSlide: initialSlide,
        title,
        identifier
      }

      const streamActions: Array<
        SetGuideAction | OpenAction | AddGuideAction
      > = [setCurrentGuide({ ...guide, slides }), open('guides')]
      // To keep Redux store as small as possible, we don't save slides into it
      if (!isError) streamActions.push(addRemoteGuide(guide))
      return streamActions
    })
  })

export default function reducer(
  state = initialState,
  action: GuideAction
): GuideState {
  switch (action.type) {
    case SET_GUIDE:
      return { ...state, currentGuide: action.guide }
    case GOTO_SLIDE:
      if (state.currentGuide === null) {
        return state
      } else {
        return {
          ...state,
          currentGuide: {
            ...state.currentGuide,
            currentSlide: action.slideIndex
          }
        }
      }
    case UPDATE_REMOTE_GUIDES:
      return { ...state, remoteGuides: action.updatedGuides }

    case ADD_GUIDE:
      // Use title as the unique identifier doesn't seem correct
      const remoteGuideTitles = state.remoteGuides.map(g => g.title)
      const builtInGuidesTitles = Object.values(docs.guide.chapters).map(
        guide => guide.title
      )
      console.log(builtInGuidesTitles)

      const alreadyAdded = remoteGuideTitles
        .concat(builtInGuidesTitles)
        .includes(action.guide.title)

      if (alreadyAdded) {
        return state
      } else {
        return {
          ...state,
          remoteGuides: state.remoteGuides.concat(action.guide)
        }
      }

    default:
      return state
  }
}

export function updateRemoteGuides(updatedGuides: Guide[]): UpdateGuideAction {
  return { type: UPDATE_REMOTE_GUIDES, updatedGuides }
}

export function clearRemoteGuides(): UpdateGuideAction {
  return updateRemoteGuides([])
}

export function addRemoteGuide(guide: Guide): AddGuideAction {
  return { type: ADD_GUIDE, guide }
}

export function fetchRemoteGuide(identifier: string): FetchGuideAction {
  return { type: FETCH_GUIDE, identifier }
}

export function setCurrentGuide(guide: Guide): SetGuideAction {
  return { type: SET_GUIDE, guide }
}

export function resetGuide(): SetGuideAction {
  return { type: SET_GUIDE, guide: null }
}

export function gotoSlide(slideIndex: number): GotoSlideAction {
  return { type: GOTO_SLIDE, slideIndex }
}

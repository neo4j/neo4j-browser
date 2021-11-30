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
import { Action } from 'redux'
import { Epic } from 'redux-observable'
import { GlobalState } from 'shared/globalState'
import { tryGetRemoteInitialSlideFromUrl } from 'services/guideResolverHelper'
import { resolveGuide } from '../../services/guideResolverHelper'
import { OpenSidebarAction, open } from '../sidebar/sidebarDuck'
import { Guide, isBuiltInGuide } from 'browser/documentation'

export const NAME = 'guides'
export const FETCH_GUIDE = 'guides/FETCH_GUIDE'
export const SET_GUIDE = 'sidebar/SET_GUIDE'
export const GOTO_SLIDE = 'sidebar/GOTO_SLIDE'
export const UPDATE_REMOTE_GUIDES = 'sidebar/UPDATE_REMOTE_GUIDES'
export const ADD_REMOTE_GUIDE = 'sidebar/ADD_REMOTE_GUIDE'

export const getCurrentGuide = (state: GlobalState): Guide | null =>
  state[NAME].currentGuide
export const getRemoteGuides = (state: GlobalState): RemoteGuide[] =>
  state[NAME].remoteGuides

export type RemoteGuide = Omit<Guide, 'slides'>
export interface GuideState {
  currentGuide: Guide | null
  remoteGuides: RemoteGuide[]
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
  | AddRemoteGuideAction

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
  updatedGuides: RemoteGuide[]
}
interface AddRemoteGuideAction {
  type: typeof ADD_REMOTE_GUIDE
  guide: RemoteGuide
}

function checkInvalidActionTypeInArray(arg: string, idx: number): void | never {
  if (!arg) {
    throw new Error(
      `Argument contains array with empty element at index ${idx}`
    )
  } else if (typeof arg !== 'string' && typeof arg !== 'symbol') {
    throw new Error(
      `Argument contains array with invalid element at index ${idx}, it should be of type: string | symbol`
    )
  }
}

/**
 * @description (curried assert function) check if action type is equal given type-constant
 * @description it works with discriminated union types
 */
function isOfType<T extends string, A extends { type: string }>(
  type: T | T[],
  action: A
): action is A extends { type: T } ? A : never

/**
 * @description (curried assert function) check if action type is equal given type-constant
 * @description it works with discriminated union types
 */
function isOfType<T extends string>(
  type: T | T[]
): <A extends { type: string }>(
  action: A
) => action is A extends { type: T } ? A : never

function isOfType<T extends string, A extends { type: T }>(
  actionTypeOrTypes: T | T[],
  action?: A
) {
  if (!actionTypeOrTypes) {
    throw new Error(`Argument 1 is empty.`)
  }

  const actionTypes = Array.isArray(actionTypeOrTypes)
    ? actionTypeOrTypes
    : [actionTypeOrTypes]

  actionTypes.forEach(checkInvalidActionTypeInArray)

  const assertFn = (_action: A) => actionTypes.includes(_action.type)

  // 1 arg case => return curried version
  if (action === undefined) {
    return assertFn
  }
  // 2 args case => invoke assertFn and return the result
  return assertFn(action)
}

export const fetchRemoteGuideEpic: Epic<
  FetchGuideAction | SetGuideAction | OpenSidebarAction | AddRemoteGuideAction,
  GlobalState
> = (action$, store$) =>
  action$.filter(isOfType(FETCH_GUIDE)).flatMap(action => {
    const initialSlide = tryGetRemoteInitialSlideFromUrl(action.identifier)
    return Observable.fromPromise(
      resolveGuide(action.identifier, store$.getState())
    ).mergeMap(({ title, identifier, slides, isError }) => {
      const guide: RemoteGuide = {
        currentSlide: initialSlide,
        title,
        identifier
      }

      const streamActions: Array<
        SetGuideAction | OpenSidebarAction | AddRemoteGuideAction
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

    case ADD_REMOTE_GUIDE:
      if (
        !!state.remoteGuides.find(
          remoteGuide => remoteGuide.identifier === action.guide.identifier
        ) ||
        isBuiltInGuide(action.guide.identifier)
      ) {
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

export function updateRemoteGuides(
  updatedGuides: RemoteGuide[]
): UpdateGuideAction {
  return { type: UPDATE_REMOTE_GUIDES, updatedGuides }
}

export function clearRemoteGuides(): UpdateGuideAction {
  return updateRemoteGuides([])
}

function addRemoteGuide(guide: RemoteGuide): AddRemoteGuideAction {
  return { type: ADD_REMOTE_GUIDE, guide }
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

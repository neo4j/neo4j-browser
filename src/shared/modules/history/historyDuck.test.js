/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
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

/* global test, expect */
import reducer, * as actions from './historyDuck'
import { dehydrate } from 'services/duckUtils'

describe('editor reducer', () => {
  test('handles editor.actionTypes.ADD_HISTORY', () => {
    const helpAction = actions.addHistory({cmd: ':help'})
    const nextState = reducer(undefined, helpAction)
    expect(dehydrate(nextState)).toEqual({
      history: [{ cmd: ':help' }],
      maxHistory: 20
    })

    // One more time
    const historyAction = actions.addHistory({cmd: ':history'})
    const nextnextState = reducer(nextState, historyAction)
    expect(dehydrate(nextnextState)).toEqual({
      history: [{ cmd: ':history' }, { cmd: ':help' }],
      maxHistory: 20
    })
  })

  test('takes editor.actionTypes.SET_MAX_HISTORY into account', () => {
    const initalState = {
      history: [
        { cmd: ':help' },
        { cmd: ':help' },
        { cmd: ':help' }
      ],
      maxHistory: 3
    }
    const helpAction = actions.addHistory({cmd: ':history'})
    const nextState = reducer(initalState, helpAction)
    expect(dehydrate(nextState)).toEqual({
      history: [
        { cmd: ':history' },
        { cmd: ':help' },
        { cmd: ':help' }
      ],
      maxHistory: 3
    })
  })
})

/* global test, expect */
import reducer, * as actions from './historyDuck'

describe('editor reducer', () => {
  test('handles editor.actionTypes.ADD_HISTORY', () => {
    const helpAction = actions.addHistory({cmd: ':help'})
    const nextState = reducer(undefined, helpAction)
    expect(nextState).toEqual({
      history: [{ cmd: ':help' }],
      maxHistory: 20
    })

    // One more time
    const historyAction = actions.addHistory({cmd: ':history'})
    const nextnextState = reducer(nextState, historyAction)
    expect(nextnextState).toEqual({
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
    expect(nextState).toEqual({
      history: [
        { cmd: ':history' },
        { cmd: ':help' },
        { cmd: ':help' }
      ],
      maxHistory: 3
    })
  })
})

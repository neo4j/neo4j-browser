import {expect} from 'chai'
import reducer, * as actions from '.'

describe('editor reducer', () => {
  it('handles editor.actionTypes.ADD_HISTORY', () => {
    const helpAction = actions.addHistory({cmd: ':help'})
    const nextState = reducer(undefined, helpAction)
    expect(nextState).to.deep.equal({
      history: [{ cmd: ':help' }],
      maxHistory: 20
    })

    // One more time
    const historyAction = actions.addHistory({cmd: ':history'})
    const nextnextState = reducer(nextState, historyAction)
    expect(nextnextState).to.deep.equal({
      history: [{ cmd: ':history' }, { cmd: ':help' }],
      maxHistory: 20
    })
  })

  it('takes editor.actionTypes.SET_MAX_HISTORY into account', () => {
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
    expect(nextState).to.deep.equal({
      history: [
        { cmd: ':history' },
        { cmd: ':help' },
        { cmd: ':help' }
      ],
      maxHistory: 3
    })
  })
})

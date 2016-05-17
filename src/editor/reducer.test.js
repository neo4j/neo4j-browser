import {expect} from 'chai'
import editor from '.'

describe('editor reducer add history', () => {
  it('handles editor.actionTypes.ADD_HISTORY', () => {
    const helpAction = editor.actions.addHistory({cmd: ':help'})
    const nextState = editor.reducer(undefined, helpAction)
    expect(nextState).to.deep.equal({
      history: [{ cmd: ':help' }],
      maxHistory: 20
    })

    // One more time
    const historyAction = editor.actions.addHistory({cmd: ':history'})
    const nextnextState = editor.reducer(nextState, historyAction)
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
    const helpAction = editor.actions.addHistory({cmd: ':history'})
    const nextState = editor.reducer(initalState, helpAction)
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

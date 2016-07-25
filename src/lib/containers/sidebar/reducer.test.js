import {expect} from 'chai'
import sidebar from '.'

describe('drawer reducer toggling drawer state', () => {
  it('should set to undefined if no drawer is in payload', () => {
    const action = {
      type: sidebar.actionTypes.TOGGLE,
      state: {}
    }
    const nextState = sidebar.reducer(undefined, action)
    expect(nextState).to.equal(null)
  })

  it('should set to undefined if drawer in payload is falsy', () => {
    const action = {
      type: sidebar.actionTypes.TOGGLE,
      state: {drawer: ''}
    }
    const nextState = sidebar.reducer(undefined, action)
    expect(nextState).to.equal(null)
  })

  it('should open a drawer when closed', () => {
    const action = {
      type: sidebar.actionTypes.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = sidebar.reducer(undefined, action)
    expect(nextState).to.equal('db')
  })

  it('should switch drawer when a different one already is open', () => {
    const initialState = 'profile'
    const action = {
      type: sidebar.actionTypes.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = sidebar.reducer(initialState, action)
    expect(nextState).to.equal('db')
  })

  it('should close drawer when the opened one is toggled', () => {
    const initialState = 'db'
    const action = {
      type: sidebar.actionTypes.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = sidebar.reducer(initialState, action)
    expect(nextState).to.equal(null)
  })
})

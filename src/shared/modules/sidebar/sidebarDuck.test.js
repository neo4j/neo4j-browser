import {expect} from 'chai'
import reducer, * as sidebar from './sidebarDuck'

describe('sidebar reducer', () => {
  it('should set to undefined if no drawer is in payload', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).to.equal(null)
  })

  it('should set to undefined if drawer in payload is falsy', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: ''}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).to.equal(null)
  })

  it('should open a drawer when closed', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).to.equal('db')
  })

  it('should switch drawer when a different one already is open', () => {
    const initialState = 'profile'
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = reducer(initialState, action)
    expect(nextState).to.equal('db')
  })

  it('should close drawer when the opened one is toggled', () => {
    const initialState = 'db'
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = reducer(initialState, action)
    expect(nextState).to.equal(null)
  })
})

describe('Sidebar actions', () => {
  it('should handle toggling drawer', () => {
    const drawerId = 'db'
    expect(sidebar.toggle(drawerId)).to.deep.equal({
      type: sidebar.TOGGLE,
      state: {drawer: drawerId}
    })
  })
})

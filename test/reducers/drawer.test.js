import {expect} from 'chai'
import {drawer} from '../../src/reducers'

describe('drawer reducer toggling drawer state', () => {
  it('should set to undefined if no drawer is in payload', () => {
    const action = {
      type: 'TOGGLE_DRAWER',
      state: {}
    }
    const nextState = drawer(undefined, action)
    expect(nextState).to.equal(null)
  })

  it('should set to undefined if drawer in payload is falsy', () => {
    const action = {
      type: 'TOGGLE_DRAWER',
      state: {drawer: ''}
    }
    const nextState = drawer(undefined, action)
    expect(nextState).to.equal(null)
  })

  it('should open a drawer when closed', () => {
    const action = {
      type: 'TOGGLE_DRAWER',
      state: {drawer: 'db'}
    }
    const nextState = drawer(undefined, action)
    expect(nextState).to.equal('db')
  })

  it('should switch drawer when a different one already is open', () => {
    const initialState = 'profile'
    const action = {
      type: 'TOGGLE_DRAWER',
      state: {drawer: 'db'}
    }
    const nextState = drawer(initialState, action)
    expect(nextState).to.equal('db')
  })

  it('should close drawer when the opened one is toggled', () => {
    const initialState = 'db'
    const action = {
      type: 'TOGGLE_DRAWER',
      state: {drawer: 'db'}
    }
    const nextState = drawer(initialState, action)
    expect(nextState).to.equal(null)
  })
})

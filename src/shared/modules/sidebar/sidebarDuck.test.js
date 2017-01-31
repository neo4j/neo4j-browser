/* global test, expect */
import reducer, * as sidebar from './sidebarDuck'

describe('sidebar reducer', () => {
  test('should set to undefined if no drawer is in payload', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(null)
  })

  test('should set to undefined if drawer in payload is falsy', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: ''}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual(null)
  })

  test('should open a drawer when closed', () => {
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = reducer(undefined, action)
    expect(nextState).toEqual('db')
  })

  test('should switch drawer when a different one already is open', () => {
    const initialState = 'profile'
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual('db')
  })

  test('should close drawer when the opened one is toggled', () => {
    const initialState = 'db'
    const action = {
      type: sidebar.TOGGLE,
      state: {drawer: 'db'}
    }
    const nextState = reducer(initialState, action)
    expect(nextState).toEqual(null)
  })
})

describe('Sidebar actions', () => {
  test('should handle toggling drawer', () => {
    const drawerId = 'db'
    expect(sidebar.toggle(drawerId)).toEqual({
      type: sidebar.TOGGLE,
      state: {drawer: drawerId}
    })
  })
})

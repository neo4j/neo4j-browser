import {expect} from 'chai'
import settings from '.'

describe('settings reducer', () => {
  it('handles initial value', () => {
    const nextState = settings.reducer(undefined, {type: ''})
    expect(nextState.cmdchar).to.equal(':')
  })

  it('handles settings.actionTypes.UPDATE without initial state', () => {
    const action = {
      type: settings.actionTypes.UPDATE,
      state: {
        greeting: 'hello'
      }
    }
    const nextState = settings.reducer(undefined, action)
    expect(nextState.greeting).to.equal('hello')
  })

  it('handles settings.actionTypes.UPDATE', () => {
    const initialState = { cmdchar: ':', greeting: 'hello', type: 'human' }
    const action = {
      type: settings.actionTypes.UPDATE,
      state: {
        greeting: 'woff',
        type: 'dog'
      }
    }
    const nextState = settings.reducer(initialState, action)
    expect(nextState).to.deep.equal({
      cmdchar: ':',
      greeting: 'woff',
      type: 'dog'
    })
  })

  it('handles settings.actionTypes.ADD_SERVER_BOOKMARK without initial state', () => {
    const state = {name: 'w', username: 'x', password: 'y', host: 'z'}
    const action = settings.actions.addServerBookmark(state)
    const nextState = settings.reducer(undefined, action)
    expect(nextState.bookmarks).to.deep.equal([state])
  })

  it('handles settings.actionTypes.ADD_SERVER_BOOKMARK by adding new bookmarks to the end', () => {
    const initialState = {
      bookmarks: [{name: 'v', username: 'x', password: 'y', host: 'z'}]
    }
    const state = {name: 'w', username: 'x', password: 'y', host: 'z'}
    const action = settings.actions.addServerBookmark(state)
    const nextState = settings.reducer(initialState, action)
    expect(nextState.bookmarks).to.deep.equal(initialState.bookmarks.concat([state]))
  })

  it('handles settings.actionTypes.ADD_SERVER_BOOKMARK by overwriting bookmarks with the same name', () => {
    const initialState = {
      bookmarks: [{name: 'v', username: 'x', password: 'y', host: 'z'}]
    }
    const state = {name: 'v', username: 'z', password: 'y', host: 'z'}
    const action = settings.actions.addServerBookmark(state)
    const nextState = settings.reducer(initialState, action)
    expect(nextState.bookmarks).to.deep.equal([state])
  })
})

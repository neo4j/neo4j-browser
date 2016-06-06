import {expect} from 'chai'
import favorites from '.'
import uuid from 'uuid'

describe('updating favorites', () => {
  it('should update state for favorites when favorites are loaded', () => {
    const initialState = []
    const favoriteScript = { name: 'A', content: 'match (n) return n limit 1' }
    const action = {
      type: favorites.actionTypes.LOAD_FAVORITES,
      favorites: [favoriteScript]
    }
    const nextState = favorites.reducer(initialState, action)
    expect(nextState.scripts).to.deep.equal([favoriteScript])
  })

  it('should update state for favorites when favorite is removed and only one item is in the list', () => {
    const favoriteScript = { name: 'Test1', content: 'match (n) return n limit 1' }
    const initialState = {scripts: [favoriteScript]}
    const action = {
      type: favorites.actionTypes.REMOVE_FAVORITE,
      favorites: [favoriteScript]
    }
    const nextState = favorites.reducer(initialState, action)
    expect(nextState.scripts).to.deep.equal([])
  })

  it('should update state for favorites when favorite is removed when there is more than one item in the list', () => {
    const favoriteScript1 = { id: uuid.v4(), name: 'Test1', content: 'match (n) return n limit 1' }
    const favoriteScript2 = { id: uuid.v4(), name: 'Test2', content: 'match (a) return a' }
    const favoriteScript3 = { id: uuid.v4(), name: 'Test3', content: 'match (a) return a' }
    const initialState = {scripts: [
      favoriteScript1,
      favoriteScript2,
      favoriteScript3
    ]}
    const action = {
      type: favorites.actionTypes.REMOVE_FAVORITE,
      id: favoriteScript2.id
    }
    const nextState = favorites.reducer(initialState, action)
    expect(nextState.scripts).to.deep.equal([favoriteScript1, favoriteScript3])
  })
})

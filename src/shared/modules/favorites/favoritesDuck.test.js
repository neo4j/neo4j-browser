import {expect} from 'chai'
import uuid from 'uuid'
import reducer, * as favorites from './favoritesDuck'

describe('favorites reducer', () => {
  it('should update state for favorites when favorite is removed and only one item is in the list', () => {
    const favoriteScript = { name: 'Test1', content: 'match (n) return n limit 1' }
    const initialState = {scripts: [favoriteScript]}
    const action = {
      type: favorites.REMOVE_FAVORITE,
      favorites: [favoriteScript]
    }
    const nextState = reducer(initialState, action)
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
      type: favorites.REMOVE_FAVORITE,
      id: favoriteScript2.id
    }
    const nextState = reducer(initialState, action)
    expect(nextState.scripts).to.deep.equal([favoriteScript1, favoriteScript3])
  })
})

describe('favorites actions', () => {
  it('should handle loading favorites', () => {
    const favs = 'favorites object'
    const expected = {
      type: favorites.LOAD_FAVORITES,
      favorites: favs
    }
    expect(favorites.hydrate(favs)).to.deep.equal(expected)
  })
  it('should handle removing favorite', () => {
    const id = uuid.v4()
    const expected = {
      type: favorites.REMOVE_FAVORITE,
      id
    }
    expect(favorites.removeFavorite(id)).to.deep.equal(expected)
  })
})

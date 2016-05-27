import {expect} from 'chai'
import favorites from '.'

describe('updating favorites', () => {
  it('should update state for favorites when favorites are loaded', () => {
    const initialState = []
    const favoriteScript = { name: 'Example', content: 'match (n) return n limit 1' }
    const action = {
      type: favorites.actionTypes.LOAD_FAVORITES,
      state: {favorites: [favoriteScript]}
    }
    const nextState = favorites.reducer(initialState, action)
    console.log(nextState)
    expect(nextState.scripts).to.deep.equal([favoriteScript])
  })
})

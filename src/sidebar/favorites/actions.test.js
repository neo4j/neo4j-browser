import {expect} from 'chai'
import favorites from '.'

describe('Favorites actions', () => {
  it('should handle loading favorites', () => {
    const favs = 'favorites object'
    const expected = {
      type: favorites.actionTypes.LOAD_FAVORITES,
      state: {favorites: favs}
    }
    expect(favorites.actions.loadFavorites(favs)).to.deep.equal(expected)
  })
})

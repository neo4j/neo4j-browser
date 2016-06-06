import {expect} from 'chai'
import uuid from 'uuid'
import favorites from '.'

describe('Favorites actions', () => {
  it('should handle loading favorites', () => {
    const favs = 'favorites object'
    const expected = {
      type: favorites.actionTypes.LOAD_FAVORITES,
      favorites: favs
    }
    expect(favorites.actions.loadFavorites(favs)).to.deep.equal(expected)
  })
  it('should handle removing favorite', () => {
    const id = uuid.v4()
    const expected = {
      type: favorites.actionTypes.REMOVE_FAVORITE,
      id
    }
    expect(favorites.actions.removeFavorite(id)).to.deep.equal(expected)
  })
})

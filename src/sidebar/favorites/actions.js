import * as t from './actionTypes'

function loadFavorites (favorites) {
  return {
    type: t.LOAD_FAVORITES,
    state: {favorites: favorites}
  }
}

export {
  loadFavorites
}

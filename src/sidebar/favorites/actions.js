import * as t from './actionTypes'

function loadFavorites (favorites) {
  return {
    type: t.LOAD_FAVORITES,
    favorites
  }
}

function removeFavorite (id) {
  return {
    type: t.REMOVE_FAVORITE,
    id
  }
}

export {
  loadFavorites,
  removeFavorite
}

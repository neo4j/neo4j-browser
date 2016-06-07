import * as t from './actionTypes'

function removeFavorite (id) {
  return {
    type: t.REMOVE_FAVORITE,
    id
  }
}
function addFavorite (cmd) {
  return {
    type: t.ADD_FAVORITE,
    cmd
  }
}
function hydrate (favorites) {
  return {
    type: t.LOAD_FAVORITES,
    favorites
  }
}

export {
  removeFavorite,
  addFavorite,
  hydrate
}

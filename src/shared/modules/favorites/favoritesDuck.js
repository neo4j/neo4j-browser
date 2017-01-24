import uuid from 'uuid'

export const NAME = 'favorites'

export const ADD_FAVORITE = 'favorites/ADD_FAVORITE'
export const REMOVE_FAVORITE = 'favorites/REMOVE_FAVORITE'
export const LOAD_FAVORITES = 'favorites/LOAD_FAVORITES'
export const FAVORITES_UPDATED = 'favorites/FAVORITES_UPDATED'
export const FAVORITES_READ = 'favorites/FAVORITES_READ'

const staticScriptsList = [
  {
    id: uuid.v4(),
    name: 'Movie Graph',
    content: ':play movie-graph'
  },
  {
    id: uuid.v4(),
    name: 'Northwind Graph',
    content: ':play northwind-graph'
  }
]

export default function reducer (state = {scripts: staticScriptsList}, action) {
  switch (action.type) {
    case REMOVE_FAVORITE:
      return Object.assign({}, state, {scripts: state.scripts.filter((favorite) => favorite.id !== action.id)})
    case ADD_FAVORITE:
      return Object.assign({}, state, {scripts: state.scripts.concat([{id: uuid.v4(), content: action.cmd}])})
    default:
      return state
  }
}

export function removeFavorite (id) {
  return {
    type: REMOVE_FAVORITE,
    id
  }
}
export function addFavorite (cmd) {
  return {
    type: ADD_FAVORITE,
    cmd
  }
}
export function hydrate (favorites) {
  return {
    type: LOAD_FAVORITES,
    favorites
  }
}

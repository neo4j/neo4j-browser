import uuid from 'uuid'
import { USER_CLEAR } from 'shared/modules/app/appDuck'

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

// reducer
const initialState = { scripts: staticScriptsList }
export default function reducer (state = initialState, action) {
  switch (action.type) {
    case REMOVE_FAVORITE:
      return Object.assign({}, state, {scripts: state.scripts.filter((favorite) => favorite.id !== action.id)})
    case ADD_FAVORITE:
      return Object.assign({}, state, {scripts: state.scripts.concat([{id: uuid.v4(), content: action.cmd}])})
    case USER_CLEAR:
      return initialState
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

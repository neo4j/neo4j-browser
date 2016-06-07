import * as t from './actionTypes'
import uuid from 'uuid'

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

export default function load (state = {scripts: staticScriptsList}, action) {
  switch (action.type) {
    case t.REMOVE_FAVORITE:
      return Object.assign({}, state, {scripts: state.scripts.filter((favorite) => favorite.id !== action.id)})
    case t.ADD_FAVORITE:
      return Object.assign({}, state, {scripts: state.scripts.concat([{id: uuid.v4(), content: action.cmd}])})
    case t.LOAD_FAVORITES:
      if (action.favorites !== null) {
        return action.favorites
      }
      return {scripts: staticScriptsList}
  }
  return state
}

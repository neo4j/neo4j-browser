import * as t from './actionTypes'

export default function load (state = { scripts: [ { name: 'Example', content: 'match (n) return n limit 1' } ] }, action) {
  switch (action.type) {
    case t.REMOVE_FAVORITE:
      let favorites = state.scripts
      if (favorites) {
        favorites = favorites.filter((favorite) => favorite.id !== action.id)
      }

      window.localStorage.setItem('neo4j.documents', JSON.stringify(favorites))

      return {
        scripts: favorites
      }
    case t.LOAD_FAVORITES:
      return {
        scripts: action.favorites
      }
  }
  return state
}

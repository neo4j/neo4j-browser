import { put, take } from 'redux-saga/effects'
import favorites from '../sidebar/favorites'
import editor from '../main/editor'

const favoritesKey = 'neo4j.documents'
function getScripts () {
  const staticFavoritesList =
    [
      { name: 'HelloA', content: 'match (n) return n limit 10' },
      { name: 'HelloB', content: 'match (n) return n limit 11' }
    ]

  return JSON.parse(window.localStorage.getItem(favoritesKey)) || staticFavoritesList
}

function * watchFavorites () {
  yield put(favorites.actions.loadFavorites(getScripts()))
  while (true) {
    const action = yield take(editor.actionTypes.ADD_FAVORITE)
    let scripts = getScripts()
    scripts.push({name: 'Unnamed script', content: action.cmd})
    window.localStorage.setItem(favoritesKey, JSON.stringify(scripts))
    yield put(favorites.actions.loadFavorites(getScripts()))
  }
}

export {
  watchFavorites
}

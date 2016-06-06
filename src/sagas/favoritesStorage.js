import { put, take } from 'redux-saga/effects'
import favorites from '../sidebar/favorites'
import editor from '../main/editor'
import uuid from 'uuid'

const favoritesKey = 'neo4j.documents'
function getScripts () {
  const staticFavoritesList =
    [
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

  return JSON.parse(window.localStorage.getItem(favoritesKey)) || staticFavoritesList
}

function * watchFavorites () {
  yield put(favorites.actions.loadFavorites(getScripts()))
  while (true) {
    const action = yield take(editor.actionTypes.ADD_FAVORITE)
    let scripts = getScripts()
    scripts.push({id: uuid.v4(), name: 'Unnamed script', content: action.cmd})
    window.localStorage.setItem(favoritesKey, JSON.stringify(scripts))
    yield put(favorites.actions.loadFavorites(getScripts()))
  }
}

export {
  watchFavorites
}

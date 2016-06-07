import { put, take } from 'redux-saga/effects'
import favorites from '../sidebar/favorites'

const favoritesKey = 'neo4j.documents'

function * watchFavorites () {
  while (true) {
    const action = yield take(favorites.actionTypes.FAVORITES_UPDATED)
    window.localStorage.setItem(favoritesKey, JSON.stringify(action.scripts))
  }
}

function * readFavorites () {
  while (true) {
    yield take(favorites.actionTypes.FAVORITES_READ)
    const favoritesFromLocalStorage = window.localStorage.getItem(favoritesKey)
    let toHydrate = null
    if (favoritesFromLocalStorage !== null) {
      toHydrate = JSON.parse(favoritesFromLocalStorage)
    }
    yield put(favorites.actions.hydrate(toHydrate))
  }
}

export {
  watchFavorites,
  readFavorites
}

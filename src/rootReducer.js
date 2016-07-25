import settings from './settings'
import frames from './lib/containers/frames'
import editor from './lib/containers/editor'
import user from './lib/containers/user'
import dbInfo from './lib/containers/dbInfo'
import favorites from './lib/containers/sidebar/favorites'
import bookmarks from './lib/containers/bookmarks'
import sidebar from './lib/containers/sidebar'
import visualization from './lib/containers/visualization'

export default {
  [bookmarks.constants.NAME]: bookmarks.reducer,
  [frames.constants.NAME]: frames.reducer,
  [settings.constants.NAME]: settings.reducer,
  [editor.constants.NAME]: editor.reducer,
  [user.constants.NAME]: user.reducer,
  [dbInfo.constants.NAME]: dbInfo.reducer,
  [favorites.constants.NAME]: favorites.reducer,
  [sidebar.constants.NAME]: sidebar.reducer,
  [visualization.constants.NAME]: visualization.reducer
}

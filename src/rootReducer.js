import settings from './settings'
import frames from './main/frames'
import editor from './main/editor'
import dbInfo from './lib/containers/dbInfo'
import favorites from './sidebar/favorites'
import bookmarks from './lib/components/Bookmarks'
import leftnav from './lib/components/LeftNav'

export default {
  [bookmarks.constants.NAME]: bookmarks.reducer,
  [frames.constants.NAME]: frames.reducer,
  [settings.constants.NAME]: settings.reducer,
  [editor.constants.NAME]: editor.reducer,
  [dbInfo.constants.NAME]: dbInfo.reducer,
  [favorites.constants.NAME]: favorites.reducer,
  [leftnav.constants.NAME]: leftnav.reducer,
}

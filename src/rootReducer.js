import settings from './settings'
import frames from './main/frames'
import editor from './main/editor'
import sidebar from './sidebar'
import dbInfo from './sidebar/dbInfo'
import favorites from './sidebar/favorites'

export default {
  [frames.constants.NAME]: frames.reducer,
  [settings.constants.NAME]: settings.reducer,
  [sidebar.constants.NAME]: sidebar.reducer,
  [editor.constants.NAME]: editor.reducer,
  [dbInfo.constants.NAME]: dbInfo.reducer,
  [favorites.constants.NAME]: favorites.reducer
}

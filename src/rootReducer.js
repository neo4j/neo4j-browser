import app from './app'
import frames from './frames'
import settings from './settings'
import sidebar from './sidebar'
import editor from './editor'
import dbInfo from './sidebar/dbInfo'

export default {
  [app.constants.NAME]: app.reducer,
  [frames.constants.NAME]: frames.reducer,
  [settings.constants.NAME]: settings.reducer,
  [sidebar.constants.NAME]: sidebar.reducer,
  [editor.constants.NAME]: editor.reducer,
  [dbInfo.constants.NAME]: dbInfo.reducer
}

import app from './app'
import frames from './frames'
import settings from './settings'
import sidebar from './sidebar'
import editor from './editor'

export default {
  [app.constants.NAME]: app.reducer,
  [frames.constants.NAME]: frames.reducer,
  [settings.constants.NAME]: settings.reducer,
  [sidebar.constants.NAME]: sidebar.reducer,
  [editor.constants.NAME]: editor.reducer
}

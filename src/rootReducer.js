import app from './app'
import frames from './frames'
import settings from './settings'
import sidebar from './sidebar'

export default {
  [app.constants.NAME]: app.reducer,
  [frames.constants.NAME]: frames.reducer,
  [settings.constants.NAME]: settings.reducer,
  [sidebar.constants.NAME]: sidebar.reducer
}

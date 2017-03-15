import settingsReducer, { NAME as settings } from 'shared/modules/settings/settingsDuck'
import streamReducer, { NAME as stream } from 'shared/modules/stream/streamDuck'
import historyReducer, { NAME as history } from 'shared/modules/history/historyDuck'
import userReducer, { NAME as currentUser } from 'shared/modules/currentUser/currentUserDuck'
import dbMetaReducer, { NAME as dbMeta } from 'shared/modules/dbMeta/dbMetaDuck'
import favoritesReducer, { NAME as favorites } from 'shared/modules/favorites/favoritesDuck'
import connectionsReducer, { NAME as connections } from 'shared/modules/connections/connectionsDuck'
import sidebarReducer, { NAME as sidebar } from 'shared/modules/sidebar/sidebarDuck'
import requestsReducer, { NAME as requests } from 'shared/modules/requests/requestsDuck'
import paramsReducer, { NAME as params } from 'shared/modules/params/paramsDuck'
import visualizationReducer, { NAME as visualization } from 'shared/modules/visualization/visualizationDuck'

export default {
  [connections]: connectionsReducer,
  [stream]: streamReducer,
  [settings]: settingsReducer,
  [history]: historyReducer,
  [currentUser]: userReducer,
  [dbMeta]: dbMetaReducer,
  [favorites]: favoritesReducer,
  [sidebar]: sidebarReducer,
  [params]: paramsReducer,
  [requests]: requestsReducer,
  [visualization]: visualizationReducer
}

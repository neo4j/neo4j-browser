
import { combineEpics } from 'redux-observable'
import { handleCommandsEpic, postConnectCmdEpic } from './modules/commands/commandsDuck'
import { checkSettingsForRoutingDriver, connectEpic, disconnectEpic, startupConnectEpic, disconnectSuccessEpic, startupConnectionSuccessEpic, startupConnectionFailEpic, detectActiveConnectionChangeEpic, connectionLostEpic } from './modules/connections/connectionsDuck'
import { dbMetaEpic, clearMetaOnDisconnectEpic } from './modules/dbMeta/dbMetaDuck'
import { cancelRequestEpic } from './modules/requests/requestsDuck'
import { discoveryOnStartupEpic } from './modules/discovery/discoveryDuck'
import { clearLocalstorageEpic } from './modules/localstorage/localstorageDuck'
import { populateEditorFromUrlEpic } from './modules/editor/editorDuck'
import { cypherRequestEpic, handleForcePasswordChangeEpic } from './modules/cypher/cypherDuck'
import { featuresDicoveryEpic } from './modules/features/featuresDuck'
import { syncItemsEpic, clearSyncEpic, syncFavoritesEpic, loadFavoritesFromSyncEpic } from './modules/sync/syncDuck'
import { loadFoldersFromSyncEpic } from './modules/favorites/foldersDuck'

export default combineEpics(
  handleCommandsEpic,
  postConnectCmdEpic,
  connectionLostEpic,
  checkSettingsForRoutingDriver,
  connectEpic,
  disconnectEpic,
  startupConnectEpic,
  disconnectSuccessEpic,
  startupConnectionSuccessEpic,
  startupConnectionFailEpic,
  detectActiveConnectionChangeEpic,
  dbMetaEpic,
  clearMetaOnDisconnectEpic,
  cancelRequestEpic,
  discoveryOnStartupEpic,
  populateEditorFromUrlEpic,
  cypherRequestEpic,
  clearLocalstorageEpic,
  handleForcePasswordChangeEpic,
  featuresDicoveryEpic,
  syncFavoritesEpic,
  loadFavoritesFromSyncEpic,
  syncItemsEpic,
  clearSyncEpic,
  loadFoldersFromSyncEpic
)

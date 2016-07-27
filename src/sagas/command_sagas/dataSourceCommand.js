import { put, select, call, spawn, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import bolt from '../../services/bolt/bolt'
import frames from '../../lib/containers/frames'
import dataSource from '../../lib/containers/dataSource'
import { splitStringOnFirst } from '../../services/commandUtils'
import { CreateDataSourceValidationError, RemoveDataSourceValidationError } from '../../services/exceptions'

export function * runCommand (ds) {
  try {
    const connection = yield call(bolt.getConnection, ds.bookmarkId)
    if (!connection) throw new Error('Could not get result from datasource "' + ds.name + '" on connection ' + ds.bookmarkId)
    const res = yield call(connection.transaction, ds.command)
    yield put(dataSource.actions.didRun(ds.id, res))
  } catch (e) {
    yield put({type: dataSource.actionTypes.DID_FAIL, error: e})
  }
}

export function * intervalRunComamnd (ds) {
  while (true) {
    yield call(runCommand, ds)
    yield call(delay, ds.refreshInterval * 1000)
  }
}

export function * ensureDataSourceStatus (dataSourcesFromState = [], refs = {}) {
  const done = []
  let localRefs = {...refs}
  for (let i = 0; i < dataSourcesFromState.length; i++) {
    const datasource = dataSourcesFromState[i]
    done.push(datasource.id)
    if (localRefs[datasource.id] !== undefined) { // Already running
      if (datasource.isActive < 1) localRefs = yield call(stopAndRemoveDataSource, datasource.id, localRefs)
      if (datasource.refreshInterval < 1) localRefs = yield call(stopAndRemoveDataSource, datasource.id, localRefs)
      continue
    }
    if (datasource.isActive < 1) continue
    if (datasource.refreshInterval < 1) {
      localRefs[datasource.id] = yield spawn(runCommand, datasource)
    } else {
      localRefs[datasource.id] = yield spawn(intervalRunComamnd, datasource)
    }
  }
  const refKeys = Object.keys(localRefs)
  if (done.length !== refKeys.length) { // Removed datasource(s) that needs to be stopped
    for (let i = 0; i < refKeys.length; i++) {
      const key = refKeys[i]
      if (done.indexOf(key) >= 0) continue
      localRefs = yield call(stopAndRemoveDataSource, key, localRefs)
    }
  }
  return localRefs
}

export function * stopAndRemoveDataSource (dataSourceId, refs) {
  const localRefs = {...refs}
  if (localRefs[dataSourceId] !== undefined) {
    yield cancel(localRefs[dataSourceId])
    delete localRefs[dataSourceId]
  }
  return localRefs
}

export function * startBackgroundDataSources (checkInterval = 10) {
  let refs = {}
  while (true) {
    const dataSourcesFromState = yield select(dataSource.selectors.getDataSources)
    refs = yield call(ensureDataSourceStatus, dataSourcesFromState, refs)
    yield call(delay, checkInterval * 1000)
  }
}

export function * handleDataSourceCommand (action, cmdchar) {
  const [subCmd] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (subCmd === 'create') {
    yield call(handleDataSourceCreateCommand, action, cmdchar)
    return
  }
  if (subCmd === 'remove') {
    yield call(handleDataSourceRemoveCommand, action, cmdchar)
    return
  }
  if (subCmd === 'list') {
    yield call(handleDataSourceListCommand, action, cmdchar)
    return
  }
  yield put(frames.actions.add({...action, type: 'unknown'}))
  return
}

export function * handleDataSourceCreateCommand (action, cmdchar) {
  // :datasource create {"name": "myName", "command": "RETURN rand()", "bookmarkId":"uuid-of-existing-bookmark", "refreshInterval": 10, "parameters": {}}
  const propsStr = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')[1]
  try {
    const props = JSON.parse(propsStr)
    if (!props ||
        !props.name ||
        !props.command ||
        !props.refreshInterval ||
        !props.bookmarkId
      ) throw new CreateDataSourceValidationError()
    yield put(dataSource.actions.add({...action, ...props}))
  } catch (e) {
    yield put(frames.actions.add({...action, error: e, type: 'error'}))
    return
  }
}

export function * handleDataSourceRemoveCommand (action, cmdchar) {
  // :datasource remove uuid-of-existing-datasource
  const dsuuid = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')[1]
  try {
    if (!dsuuid) {
      throw new RemoveDataSourceValidationError()
    } else {
      yield put(dataSource.actions.remove(dsuuid))
    }
  } catch (e) {
    yield put(frames.actions.add({...action, error: e, type: 'error'}))
    return
  }
}

export function * handleDataSourceListCommand (action, cmdchar) {
  const state = yield select(dataSource.selectors.getDataSources)
  yield put(frames.actions.add({...action, contents: JSON.stringify(state, null, 2), type: 'pre'}))
}

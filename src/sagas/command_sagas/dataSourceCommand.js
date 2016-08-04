import { put, select, call, spawn, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import uuid from 'uuid'
import dataSource from '../../lib/containers/dataSource'
import { splitStringOnFirst } from '../../services/commandUtils'
import { UnknownCommandError, CreateDataSourceValidationError, RemoveDataSourceValidationError } from '../../services/exceptions'

export function * runCommand (ds) {
  const resultId = ds.resultId || uuid.v4()
  yield put(dataSource.actions.executeCommand(ds.command, ds.id, ds.bookmarkId, resultId))
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
    let runFn = intervalRunComamnd
    if (datasource.refreshInterval < 1) runFn = runCommand
    localRefs[datasource.id] = yield spawn(runFn, datasource)
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

export function * handleDataSourceCommand (action, cmdchar, onSuccess, onError) {
  const [subCmd] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (subCmd === 'create') {
    yield call(handleDataSourceCreateCommand, action, cmdchar, onSuccess, onError)
    return
  }
  if (subCmd === 'remove') {
    yield call(handleDataSourceRemoveCommand, action, cmdchar, onSuccess, onError)
    return
  }
  if (subCmd === 'list') {
    yield call(handleDataSourceListCommand, action, cmdchar, onSuccess, onError)
    return
  }
  yield call(onError, {...action, type: 'unknown'}, UnknownCommandError(action.cmd))
  return
}

export function * handleDataSourceCreateCommand (action, cmdchar, onSuccess, onError) {
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
    yield call(onError, {...action, type: 'error'}, e)
    return
  }
}

export function * handleDataSourceRemoveCommand (action, cmdchar, onSuccess, onError) {
  // :datasource remove uuid-of-existing-datasource
  const dsuuid = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')[1]
  try {
    if (!dsuuid) {
      throw new RemoveDataSourceValidationError()
    } else {
      yield put(dataSource.actions.remove(dsuuid))
    }
  } catch (e) {
    yield call(onError, {...action, type: 'error'}, e)
    return
  }
}

export function * handleDataSourceListCommand (action, cmdchar, onSuccess, onError) {
  const state = yield select(dataSource.selectors.getDataSources)
  yield call(onSuccess, {...action, type: 'pre'}, JSON.stringify(state, null, 2))
}

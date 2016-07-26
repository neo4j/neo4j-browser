import { take, put, select, call, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import bolt from '../../services/bolt/bolt'
import uuid from 'uuid'
import frames from '../../lib/containers/frames'
import dataSource from '../../lib/containers/dataSource'
import { splitStringOnFirst, splitStringOnLast } from '../../services/commandUtils'
import { UserException } from '../../services/exceptions'

function * runCommand (ds) {
  while (true) {
    try {
      const connection = yield call(bolt.getConnection, ds.bookmarkId)
      if (!connection) throw new Error('Could not get result from datasource "' + ds.name + '" on connection ' + ds.bookmarkId)
      const res = yield call(connection.transaction, ds.command)
      yield put(dataSource.actions.didRun(ds.id, res))
    } catch (e) {
      console.log(e)
    }
    yield call(delay, ds.refreshInterval*1000)
  }
}

function * ensureDataSourceStatus (dataSourcesFromState = [], refs = {}) {
  const done = []
  for(let i = 0; i < dataSourcesFromState.length; i++) {
    const datasource = dataSourcesFromState[i]
    done.push(datasource.id)
    if (datasource.refreshInterval < 1) {
      refs = yield stopAndRemoveDataSource(datasource.id, refs)
      return
    }
    if (datasource.isActive < 1) {
      refs = yield stopAndRemoveDataSource(datasource.id, refs)
      return
    }
    if (refs[datasource.id] !== undefined) return // Already running
    const ref = yield fork(runCommand, datasource)
    refs[datasource.id] = ref
  }
  if (done.length !== refs.length) { // Removed datasource(s) that needs to be stopped
    const keys = Object.keys(refs)
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (done.indexOf(key) >= 0) return
      refs = yield stopAndRemoveDataSource(key, refs)
    }
  }
  return refs
}

function * stopAndRemoveDataSource (widgetId, refs) {
  const localRefs = {...refs}
  if (localRefs[widgetId] !== undefined) {
    yield cancel(localRefs[widgetId])
    delete localRefs[widgetId]
  }
  return localRefs
}

export function * startBackgroundDataSources () {
  let refs = {}
  while (true) {
    yield take(dataSource.actionTypes.UPDATE)
    const dataSourcesFromState = yield select(dataSource.selectors.getDataSources)
    refs = yield call(ensureDataSourceStatus, dataSourcesFromState, refs)
    yield call(delay, 5000)
  }
}

export function * handleDataSourceCommand (action, cmdchar) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'create') {
    yield call(handleDataSourceCreateCommand, action, cmdchar)
    return
  }
  if (serverCmd === 'remove') {
    yield call(handleDataSourceRemoveCommand, action, cmdchar)
    return
  }
  if (serverCmd === 'list') {
    yield call(handleDataSourceListCommand, action, cmdchar)
    return
  }
  return
}

export function * handleDataSourceCreateCommand (action, cmdchar) {
  // :datasource create {"name": "myName", "command": "RETURN rand()", "bookmarkId":"uuid-of-existing-bookmark", "refreshInterval": 10, "parameters": {}}
  const [serverCmd, propsStr] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  try {
    const props = JSON.parse(propsStr)
    const errorMessage = 'Wrong format. It should be ":datasource create {"name": "myName", "command": "RETURN rand()", "bookmarkId":"uuid-of-existing-bookmark", "refreshInterval": 10, "parameters": {}}"'
    if (!props ||
        !props.name ||
        !props.command ||
        !props.refreshInterval ||
        !props.bookmarkId
      ) throw new UserException(errorMessage)
      yield put(dataSource.actions.add({...action, ...props}))
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
    return
  }
}

export function * handleDataSourceRemoveCommand (action, cmdchar) {
  // :datasource remove uuid-of-existing-datasource
  const [serverCmd, dsuuid] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  try {
    if (!dsuuid) {
      const errorMessage = 'Wrong format. It should be ":datasource remove uuid-of-existing-datasource"'
      throw new UserException(errorMessage)
    } else {
      yield put(dataSource.actions.remove(dsuuid))
    }
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
    return
  }
}

export function * handleDataSourceListCommand (action, cmdchar) {
  const state = yield select(dataSource.selectors.getDataSources)
  yield put(frames.actions.add({...action, contents: JSON.stringify(state, null, 2), type: 'pre'}))
}

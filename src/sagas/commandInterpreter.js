import { put, select, call } from 'redux-saga/effects'
import { takeEvery } from 'redux-saga'
import helper from 'services/commandInterpreterHelper'
import * as dataSource from '../shared/modules/dataSource/dataSourceDuck'
import * as stream from '../shared/modules/stream/streamDuck'
import { getSettings } from '../selectors'
import { cleanCommand } from 'services/commandUtils'
import * as history from '../shared/modules/history/historyDuck'
import * as commands from '../shared/modules/commands/commandsDuck'
import bolt from 'services/bolt/bolt'
import { BoltConnectionError, BoltError, Neo4jError, getErrorMessage } from 'services/exceptions'

function * createSucessFrame (meta, result) {
  meta.result = result
  yield put(stream.add(meta))
}

function * createErrorFrame (meta, error) {
  if (meta.type === 'cypher' && error && error.fields) { // Cypher error from Bolt
    meta.originalError = {...error} // Keep original
    error = BoltError(error)
  } else if (error instanceof bolt.neo4j.Neo4jError) {
    meta.originalError = {...error} // Keep original
    error = Neo4jError(error)
  }
  meta.error = {message: getErrorMessage(error)}
  meta.originalType = meta.type
  meta.type = 'error'
  yield put(stream.add(meta))
}

function * dataSourceDidRun (meta, result) {
  yield put(dataSource.didRun(meta.dataSourceId, {result}))
}

function * dataSourceDidFail (meta, error) {
  yield put({type: dataSource.DID_FAIL, error: getErrorMessage(error)})
}

function * watchCommands () {
  while (true) {
    yield * takeEvery([
      commands.USER_COMMAND_QUEUED,
      dataSource.COMMAND_QUEUED
    ], handleCommand)
  }
}

function * handleCommand (action) {
  let onSuccess
  let onError
  if (action.type === commands.USER_COMMAND_QUEUED) {
    yield put(history.addHistory({cmd: action.cmd}))
    onSuccess = action.onSuccess || createSucessFrame
    onError = action.onError || createErrorFrame
  } else {
    onSuccess = action.onSuccess || dataSourceDidRun
    onError = action.onError || dataSourceDidFail
  }
  const settingsState = yield select(getSettings)
  const cleanCmd = cleanCommand(action.cmd)
  if (cleanCmd[0] === settingsState.cmdchar) {
    yield call(handleClientCommand, action, settingsState.cmdchar, onSuccess, onError)
  } else {
    try {
      const connection = yield call(bolt.getConnection, action.bookmarkId)
      if (!connection) throw new BoltConnectionError(action.bookmarkId)
      const res = yield call(connection.transaction, action.cmd)
      yield call(onSuccess, {...action, type: 'cypher'}, res)
    } catch (e) {
      yield call(onError, {...action, error: {...e}, type: 'cypher'}, e)
    }
  }
}

function * handleClientCommand (action, cmdchar, onSuccess, onError) {
  const interpreted = helper.interpret(action.cmd.substr(cmdchar.length))
  yield call(interpreted.exec, action, cmdchar, onSuccess, onError)
}

export {
  watchCommands,
  handleCommand,
  handleClientCommand
}

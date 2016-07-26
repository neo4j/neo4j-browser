import { take, put, select, call, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import bolt from '../../services/bolt/bolt'
import frames from '../../lib/containers/frames'
import { splitStringOnFirst, splitStringOnLast } from '../../services/commandUtils'
import { UserException } from '../../services/exceptions'

export function * handleWidgetCommand (action, cmdchar) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'render') {
    yield call(handleWidgetRenderCommand, action, cmdchar)
    return
  }
  return
}

export function * handleWidgetRenderCommand (action, cmdchar) {
  const [serverCmd, uuid] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  yield put(frames.actions.add({...action, contents: uuid, type: 'widget'}))
}

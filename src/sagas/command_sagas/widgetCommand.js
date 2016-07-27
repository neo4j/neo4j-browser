import { put, call } from 'redux-saga/effects'
import frames from '../../lib/containers/frames'
import { splitStringOnFirst } from '../../services/commandUtils'

export function * handleWidgetCommand (action, cmdchar) {
  const [serverCmd] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'render') {
    yield call(handleWidgetRenderCommand, action, cmdchar)
    return
  }
  return
}

export function * handleWidgetRenderCommand (action, cmdchar) {
  const uuid = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')[1]
  yield put(frames.actions.add({...action, contents: uuid, type: 'widget'}))
}

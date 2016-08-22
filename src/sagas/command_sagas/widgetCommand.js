import { call } from 'redux-saga/effects'
import { splitStringOnFirst } from 'services/commandUtils'

export function * handleWidgetCommand (action, cmdchar, onSuccess, onError) {
  const [serverCmd] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'render') {
    yield call(handleWidgetRenderCommand, action, cmdchar, onSuccess, onError)
    return
  }
  return
}

export function * handleWidgetRenderCommand (action, cmdchar, onSuccess) {
  const uuid = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')[1]
  yield call(onSuccess, {...action, type: 'widget'}, uuid)
}

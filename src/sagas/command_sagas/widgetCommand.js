import { take, put, select, call } from 'redux-saga/effects'
import frames from '../../lib/containers/frames'
import widgets from '../../lib/containers/widgets'
import { splitStringOnFirst, splitStringOnLast } from '../../services/commandUtils'
import { UserException } from '../../services/exceptions'

export function * handleWidgetCommand (action, cmdchar) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'add') {
    yield call(handleWidgetAddCommand, action, cmdchar)
    return
  }
  return
}


export function * handleWidgetAddCommand (action, cmdchar) {
  // :widget add {"name": "myName", "command": "RETURN rand()", "outputFormat": "ascii", "refreshInterval": 10, "place": "dashboard", "pos": 5, "classNames": ""}
  const [serverCmd, propsStr] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  try {
    const props = JSON.parse(propsStr)
    const errorMessage = 'Wrong format. It should be ":widget add {"name": "myName", "command": "RETURN rand()", "outputFormat": "ascii", "refreshInterval": 10, "place": "dashboard", "pos": 5, "classNames": ""}"'
    if (!props ||
        !props.name ||
        !props.command ||
        !props.outputFormat ||
        !props.refreshInterval ||
        !props.place ||
        props.pos < 0
      ) throw new UserException(errorMessage)
      yield put(widgets.actions.add({...props}))
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
    return
  }
}

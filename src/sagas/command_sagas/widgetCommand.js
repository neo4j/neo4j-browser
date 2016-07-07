import { take, put, select, call, fork } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import bolt from '../../services/bolt/bolt'
import uuid from 'uuid'
import frames from '../../lib/containers/frames'
import widgets from '../../lib/containers/widgets'
import { splitStringOnFirst, splitStringOnLast } from '../../services/commandUtils'
import { UserException } from '../../services/exceptions'

function * runWidget (widget) {
  while (true) {
    try {
      const res = yield call(bolt.transaction, widget.command)
      yield put(widgets.actions.didRun(widget.id, res))
    } catch (e) {
    }
    yield call(delay, widget.refreshInterval*1000)
  }
}

function * ensureWidgetStatus (widgetsFromState = [], refs = {}) {
  const done = []
  for(let i = 0; i < widgetsFromState.length; i++) {
    const widget = widgetsFromState[i]
    done.push(widget.id)
    if (widget.refreshInterval < 1) {
      refs = yield stopAndRemoveWidget(widget.id, refs)
      return
    }
    if (widget.isActive < 1) {
      refs = yield stopAndRemoveWidget(widget.id, refs)
      return
    }
    if (refs[widget.id] !== undefined) return // Already running
    const ref = yield fork(runWidget, widget)
    refs[widget.id] = ref
  }
  if (done.length !== refs.length) { // Removed widget(s) that needs to be stopped
    const keys = Object.keys(refs)
    for(let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (done.indexOf(key) >= 0) return
      refs = yield stopAndRemoveWidget(key, refs)
    }
  }
  return refs
}

function * stopAndRemoveWidget (widgetId, refs) {
  const localRefs = {...refs}
  if (localRefs[widgetId] !== undefined) {
    yield cancel(localRefs[widgetId])
    delete localRefs[widgetId]
  }
  return localRefs
}

export function * startBackgroundWidgets () {
  let refs = {}
  while (true) {
    yield take(widgets.actionTypes.WIDGETS_UPDATE)
    const widgetsFromState = yield select(widgets.selectors.getWidgets)
    refs = yield call(ensureWidgetStatus, widgetsFromState, refs)
    yield call(delay, 5000)
  }
}

export function * handleWidgetCommand (action, cmdchar) {
  const [serverCmd, props] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  if (serverCmd === 'add') {
    yield call(handleWidgetAddCommand, action, cmdchar)
    return
  }
  if (serverCmd === 'call') {
    yield call(handleWidgetCallCommand, action, cmdchar)
    return
  }
  return
}

export function * handleWidgetAddCommand (action, cmdchar) {
  // :widget add {"name": "myName", "command": "RETURN rand()", "outputFormat": "ascii", "refreshInterval": 10, "place": "dashboard", "pos": 5, "classNames": "", "arg": {}}
  const [serverCmd, propsStr] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  try {
    const props = JSON.parse(propsStr)
    const errorMessage = 'Wrong format. It should be ":widget add {"name": "myName", "command": "RETURN rand()", "outputFormat": "ascii", "refreshInterval": 10, "place": "dashboard", "pos": 5, "classNames": "", "arg":{}}"'
    if (!props ||
        !props.name ||
        !props.command ||
        !props.outputFormat ||
        !props.refreshInterval ||
        !props.place ||
        props.pos < 0
      ) throw new UserException(errorMessage)
      yield put(widgets.actions.add({...action, ...props}))
  } catch (e) {
    yield put(frames.actions.add({...action, errors: e, type: 'cmd'}))
    return
  }
}

export function * handleWidgetCallCommand (action, cmdchar) {
  const [serverCmd, name] = splitStringOnFirst(splitStringOnFirst(action.cmd.substr(cmdchar.length), ' ')[1], ' ')
  yield put(frames.actions.add({...action, content: name, type: 'widget'}))
}

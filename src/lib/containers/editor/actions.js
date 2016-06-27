import * as t from './actionTypes'

export const executeCommand = (cmd, contextId) => {
  return {
    type: t.USER_COMMAND_QUEUED,
    cmd,
    id: contextId
  }
}

export const addHistory = (state) => {
  return {
    type: t.ADD_HISTORY,
    state: state
  }
}

export const setMaxHistory = (maxHistory) => {
  return {
    type: t.SET_MAX_HISTORY,
    maxHistory: maxHistory
  }
}

export const setContent = (cmd) => {
  return {
    type: t.SET_CONTENT,
    cmd: cmd
  }
}

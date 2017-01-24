const NAME = 'commands'

export const USER_COMMAND_QUEUED = NAME + '/USER_COMMAND_QUEUED'

export const executeCommand = (cmd, contextId) => {
  return {
    type: USER_COMMAND_QUEUED,
    cmd,
    id: contextId
  }
}

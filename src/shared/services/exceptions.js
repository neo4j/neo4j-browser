import * as messages from './exceptionMessages'

export function getErrorMessage (errorObject) {
  let str = messages[errorObject.type]
  if (!str) return
  const keys = Object.keys(errorObject)
  keys.forEach((prop) => {
    const re = new RegExp('(#' + prop + '#)', 'g')
    str = str.replace(re, errorObject[prop])
  })
  return str
}

export function UserException (message) {
  return {
    type: 'UserException',
    message
  }
}

export function ConnectionException (message, code = 'Connection Error') {
  return {fields: [{
    code,
    message
  }]}
}

export function AddServerValidationError () {
  return {
    type: 'AddServerValidationError'
  }
}

export function CreateDataSourceValidationError () {
  return {
    type: 'CreateDataSourceValidationError'
  }
}

export function RemoveDataSourceValidationError () {
  return {
    type: 'RemoveDataSourceValidationError'
  }
}

export function BoltConnectionError (id) {
  return {
    type: 'BoltConnectionError',
    id
  }
}

export function BoltError (obj) {
  return {
    type: 'BoltError',
    code: obj.fields[0].code,
    message: obj.fields[0].message
  }
}

export function Neo4jError (obj) {
  return {
    type: 'Neo4jError',
    message: obj.message
  }
}

export function ConnectionNotFoundError (name) {
  return {
    type: 'ConnectionNotFoundError',
    name
  }
}

export function OpenConnectionNotFoundError (name) {
  return {
    type: 'OpenConnectionNotFoundError',
    name
  }
}

export function UnknownCommandError (cmd) {
  return {
    type: 'UnknownCommandError',
    cmd
  }
}

export function CouldNotFetchRemoteGuideError (error) {
  return {
    type: 'CouldNotFetchRemoteGuideError',
    error
  }
}

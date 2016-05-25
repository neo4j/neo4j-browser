export function UserException (message) {
  this.message = message
  this.name = 'UserException'
}

export function ConnectionException (message, code = 'Connection Error') {
  return {fields: [{
    code,
    message
  }]}
}

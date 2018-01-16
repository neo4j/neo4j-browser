/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as messages from './exceptionMessages'

export function getErrorMessage (errorObject) {
  let str = messages[errorObject.type]
  if (!str) return
  const keys = Object.keys(errorObject)
  keys.forEach(prop => {
    const re = new RegExp('(#' + prop + '#)', 'g')
    str = str.replace(re, errorObject[prop])
  })
  return str
}

export function createErrorObject (ErrorType, ...rest) {
  const obj = new ErrorType(...rest)
  if (!obj.code) obj.code = obj.type
  obj.message = getErrorMessage(obj)
  return obj
}

export function UserException (message) {
  return {
    type: 'UserException',
    message
  }
}

export function ConnectionException (message, code = 'Connection Error') {
  return {
    fields: [
      {
        code,
        message
      }
    ]
  }
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

export function BoltConnectionError () {
  return {
    type: 'BoltConnectionError'
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

export function FetchURLError (error) {
  return {
    type: 'FetchURLError',
    error
  }
}

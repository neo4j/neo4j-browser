/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

export function getErrorMessage(errorObject) {
  let str = messages[errorObject.type]
  if (!str) return
  const keys = Object.keys(errorObject)
  keys.forEach(prop => {
    const re = new RegExp(`(#${prop}#)`, 'g')
    str = str.replace(re, errorObject[prop])
  })
  return str
}

export function createErrorObject(ErrorType, ...rest) {
  let Co = ErrorType
  if (typeof ErrorType === 'string' && errorFunctions[ErrorType]) {
    Co = errorFunctions[ErrorType]
  }
  const obj = new Co(...rest)
  if (!obj.code) obj.code = obj.type
  obj.message = getErrorMessage(obj)
  return obj
}

const errorFunctions = {}

export function BoltConnectionError() {
  return {
    type: 'BoltConnectionError'
  }
}
errorFunctions.BoltConnectionError = BoltConnectionError

export function BoltError(obj) {
  return {
    type: 'BoltError',
    code: obj.fields[0].code,
    message: obj.fields[0].message
  }
}
errorFunctions.BoltError = BoltError

export function Neo4jError(obj) {
  return {
    type: 'Neo4jError',
    message: obj.message
  }
}
errorFunctions.Neo4jError = Neo4jError

export function UnknownCommandError(error) {
  return {
    type: 'UnknownCommandError',
    cmd: error.cmd
  }
}
errorFunctions.UnknownCommandError = UnknownCommandError

export function UndefinedError(error) {
  return {
    type: 'UndefinedError',
    cmd: error.cmd
  }
}
errorFunctions.UndefinedError = UndefinedError

export function CouldNotFetchRemoteGuideError(error) {
  return {
    type: 'CouldNotFetchRemoteGuideError',
    error: error.error
  }
}
errorFunctions.CouldNotFetchRemoteGuideError = CouldNotFetchRemoteGuideError

export function FetchURLError(error) {
  return {
    type: 'FetchURLError',
    error: error.error
  }
}
errorFunctions.FetchURLError = FetchURLError

export function UnsupportedError(message) {
  return {
    type: 'UnsupportedError',
    message
  }
}
errorFunctions.UnsupportedError = UnsupportedError

export function NotFoundError(message) {
  return {
    type: 'NotFoundError',
    message
  }
}
errorFunctions.NotFoundError = NotFoundError

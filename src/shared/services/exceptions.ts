/*
 * Copyright (c) "Neo4j"
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

export function getErrorMessage(errorObject: any) {
  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  let str = messages[errorObject.type]
  if (!str) return
  const keys = Object.keys(errorObject)
  keys.forEach(prop => {
    const re = new RegExp(`(#${prop}#)`, 'g')
    str = str.replace(re, errorObject[prop])
  })
  return str
}

export function createErrorObject(ErrorType: any, ...rest: any[]) {
  let Co = ErrorType
  if (typeof ErrorType === 'string' && errorFunctions[ErrorType]) {
    Co = errorFunctions[ErrorType]
  }
  const obj = new Co(...rest)
  if (!obj.code) obj.code = obj.type
  obj.message = getErrorMessage(obj)
  return obj
}

const errorFunctions: any = {}

export function BoltConnectionError() {
  return {
    type: 'BoltConnectionError'
  }
}
errorFunctions.BoltConnectionError = BoltConnectionError

export function BoltError(obj: any) {
  return {
    type: 'BoltError',
    code: obj.fields[0].code,
    message: obj.fields[0].message
  }
}
errorFunctions.BoltError = BoltError

export function Neo4jError(obj: any) {
  return {
    type: 'Neo4jError',
    message: obj.message
  }
}
errorFunctions.Neo4jError = Neo4jError

export function UnknownCommandError(error: any) {
  return {
    type: 'UnknownCommandError',
    cmd: error.cmd
  }
}
errorFunctions.UnknownCommandError = UnknownCommandError

export function UndefinedError(error: any) {
  return {
    type: 'UndefinedError',
    cmd: error.cmd
  }
}
errorFunctions.UndefinedError = UndefinedError

export function CouldNotFetchRemoteGuideError(error: any) {
  return {
    type: 'CouldNotFetchRemoteGuideError',
    error: error.error
  }
}
errorFunctions.CouldNotFetchRemoteGuideError = CouldNotFetchRemoteGuideError

export function FetchURLError(error: any) {
  return {
    type: 'FetchURLError',
    error: error.error
  }
}
errorFunctions.FetchURLError = FetchURLError

export function UnsupportedError(message: any) {
  return {
    type: 'UnsupportedError',
    message
  }
}
errorFunctions.UnsupportedError = UnsupportedError

export function NotFoundError(message: any) {
  return {
    type: 'NotFoundError',
    message
  }
}
errorFunctions.NotFoundError = NotFoundError

export function InvalidGrassError(message: any) {
  return {
    type: 'InvalidGrassError',
    message
  }
}
errorFunctions.InvalidGrassError = InvalidGrassError

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

export type ErrorType =
  | 'BoltConnectionError'
  | 'BoltError'
  | 'Neo4jError'
  | 'UnknownCommandError'
  | 'UndefinedError'
  | 'CouldNotFetchRemoteGuideError'
  | 'FetchUrlError'
  | 'UnsupportedError'
  | 'NotFoundError'
  | 'InvalidGrassError'
  | 'DatabaseNotFoundError'
  | 'DatabaseUnavailableError'

export type BrowserError = { type: ErrorType; message: string; code: string }

// All errors except bolt errors have their type as their error code
export function BoltConnectionError(): BrowserError {
  const type = 'BoltConnectionError'
  return {
    type,
    code: type,
    message: 'No connection found, did you connect to Neo4j?'
  }
}

function BoltError(obj: {
  fields: [{ code: string; message: string }]
}): BrowserError {
  return {
    type: 'BoltError',
    code: obj.fields[0].code,
    message: `${obj.fields[0].code} - ${obj.fields[0].message}`
  }
}

function Neo4jError(obj: { message: string }): BrowserError {
  const type = 'Neo4jError'
  return {
    type,
    code: type,
    message: obj.message
  }
}

export function UnknownCommandError(error: { cmd: string }): BrowserError {
  const type = 'UnknownCommandError'
  return {
    type,
    code: type,
    message: `Unknown command ${error.cmd}`
  }
}

function UndefinedError(error: { cmd: string }): BrowserError {
  const type = 'UndefinedError'
  return {
    type,
    code: type,
    message: `Undefined error. cmd: ${error.cmd}`
  }
}

export function CouldNotFetchRemoteGuideError(error: {
  error: string
}): BrowserError {
  const type = 'CouldNotFetchRemoteGuideError'
  return {
    type,
    code: type,
    message: `Could not fetch remote guide: ${error.error}`
  }
}

export function FetchUrlError(error: { error: string }): BrowserError {
  const type = 'FetchUrlError'
  return {
    type,
    code: type,
    message: `Could not fetch URL: "${error.error}". This could be due to the remote server policy. See your web browsers error console for more information.`
  }
}

export function UnsupportedError(message: string): BrowserError {
  const type = 'UnsupportedError'
  return { type, code: type, message }
}

function NotFoundError(message: string): BrowserError {
  const type = 'NotFoundError'
  return { type, code: type, message }
}

export function InvalidGrassError(message: string): BrowserError {
  const type = 'InvalidGrassError'
  return { type, code: type, message }
}

export function DatabaseNotFoundError({
  dbName
}: {
  dbName: string
}): BrowserError {
  const type = 'DatabaseNotFoundError'
  return {
    type,
    code: type,
    message: `A database with the "${dbName}" name or alias could not be found.`
  }
}

export function DatabaseUnavailableError({
  dbName,
  dbMeta
}: {
  dbName: string
  dbMeta: { status: string }
}): BrowserError {
  const type = 'DatabaseUnavailableError'
  return {
    type,
    code: type,
    message: `Database "${dbName}" is unavailable, its status is "${dbMeta.status}".`
  }
}

// this utilfunction should not be needed, but the use in Errorframe is not tested to work without it
export function createErrorObject(type: ErrorType, args: any): BrowserError {
  const errorFunctions: Record<ErrorType, (arg: any) => BrowserError> = {
    BoltConnectionError,
    BoltError,
    Neo4jError,
    UnknownCommandError,
    UndefinedError,
    CouldNotFetchRemoteGuideError,
    FetchUrlError,
    UnsupportedError,
    NotFoundError,
    InvalidGrassError,
    DatabaseNotFoundError,
    DatabaseUnavailableError
  }

  return errorFunctions[type](args)
}

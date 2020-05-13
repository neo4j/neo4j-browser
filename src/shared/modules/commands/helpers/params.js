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
import jsonic from 'jsonic'
import { splitStringOnFirst } from 'services/commandUtils'
import { update, replace } from 'shared/modules/params/paramsDuck'
import { collectLambdaValues, parseLambdaStatement } from './lambdas'
import { SYSTEM_DB } from 'shared/modules/dbMeta/dbMetaDuck'

export const extractParams = param => {
  // early bail, now handled by parser
  if (param.includes('=>')) {
    return {
      isFn: true
    }
  }

  const matchParam = param.match(/^(".*"|'.*'|\S+)\s?(:|=>)\s([^$]*)$/)
  if (!matchParam) return {}
  const [, paramName, delimiter, paramValue] = matchParam
  try {
    const json = `{${paramName}${
      paramName.endsWith(':') ? ' ' : ': '
    }${paramValue}}`
    const res = jsonic(json)
    const key = Object.keys(res)[0]
    const value = res[key]
    return {
      key,
      value,
      isFn: delimiter ? delimiter.includes('=>') : false,
      originalParamValue: paramValue
    }
  } catch (e) {
    return {
      key: paramName,
      value: paramValue,
      isFn: delimiter ? delimiter.includes('=>') : false,
      originalParamValue: paramValue
    }
  }
}

const resolveAndStoreJsonValue = (param, put) => {
  try {
    const json = `{${param}}`
    const res = jsonic(json)
    put(update(res))
    return { result: res, type: 'param' }
  } catch (e) {
    throw new Error(`Could not parse input. Usage: \`:param x => 2\`. ${e}`)
  }
}

export const getParamName = (input, cmdchar) => {
  const strippedCmd = input.cmd.substr(cmdchar.length)
  const parts = splitStringOnFirst(strippedCmd, ' ')

  return parts[0].trim()
}

export const handleParamsCommand = (action, cmdchar, put, targetDb) => {
  if (targetDb === SYSTEM_DB) {
    return Promise.reject(
      new Error('Parameters cannot be declared when using system database.')
    )
  }
  const strippedCmd = action.cmd.substr(cmdchar.length)
  const parts = splitStringOnFirst(strippedCmd, ' ')
  const param = parts[1].trim()

  return Promise.resolve().then(() => {
    if (/^"?\{.*\}"?$/.test(param)) {
      // JSON object string {"x": 2, "y":"string"}
      try {
        const res = jsonic(param.replace(/^"/, '').replace(/"$/, '')) // Remove any surrounding quotes
        put(replace(res))
        return { result: res, type: 'params' }
      } catch (e) {
        throw new Error(
          `Could not parse input. Usage: \`:params {"x":1,"y":"string"}\`. ${e}`
        )
      }
    }

    // Single param
    const { key, isFn } = extractParams(param)

    if (!isFn && Boolean(key)) {
      return resolveAndStoreJsonValue(param, put)
    }

    return parseLambdaStatement(param)
      .then(ast => collectLambdaValues(ast, action.requestId))
      .then(result => {
        put(update(result))

        return { result, type: 'param' }
      })
  })
}

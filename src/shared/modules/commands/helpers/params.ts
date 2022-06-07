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
import jsonic from 'jsonic'

import { collectLambdaValues, parseLambdaStatement } from './lambdas'
import { splitStringOnFirst } from 'services/commandUtils'
import { replace, update } from 'shared/modules/params/paramsDuck'
import { SYSTEM_DB } from 'shared/modules/dbMeta/dbMetaDuck'

export const extractParams = (param: string) => {
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

const resolveAndStoreJsonValue = (param: any, put: any) => {
  try {
    const json = `{${param}}`
    const res = jsonic(json)
    put(update(res))
    return { result: res, type: 'param' }
  } catch (e) {
    throw new Error(`Could not parse input. Usage: \`:param x => 2\`. ${e}`)
  }
}

export const getParamName = (input: any) => {
  const strippedCmd = input.cmd.substr(1)
  const parts = splitStringOnFirst(strippedCmd, ' ')

  return parts[0].trim()
}

export const handleParamsCommand = async (
  action: any,
  put: any,
  targetDb?: string | null
): Promise<{
  result: any
  type: string
}> => {
  if (targetDb === SYSTEM_DB) {
    throw new Error('Parameters cannot be declared when using system database.')
  }
  const strippedCmd = action.cmd.substr(1)
  const parts = splitStringOnFirst(strippedCmd, /\s/)
  const param = parts[1].trim()

  if (/^"?\{[\s\S]*\}"?$/.test(param)) {
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
}

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
import jsonic from 'jsonic'
import bolt from 'services/bolt/bolt'
import { recursivelyTypeGraphItems } from 'services/bolt/boltMappings'
import {
  splitStringOnFirst,
  mapParamToCypherStatement
} from 'services/commandUtils'
import { update, replace } from 'shared/modules/params/paramsDuck'

export const extractParams = param => {
  const matchParam = param.match(/^(".*"|'.*'|\S+)\s?(:|=>)\s(.*)/)
  if (!matchParam) return {}
  const [, paramName, delimiter, paramValue] = matchParam
  const json =
    '{' + paramName + (paramName.endsWith(':') ? ' ' : ': ') + paramValue + '}'
  const res = jsonic(json)
  const key = Object.keys(res)[0]
  const value = res[key]

  return { key, value, isFn: delimiter ? delimiter.includes('=>') : false }
}

const resolveAndStoreJsonValue = (param, put, resolve, reject) => {
  try {
    const json = `{${param}}`
    const res = jsonic(json)
    put(update(res))
    return resolve({ result: res, type: 'param' })
  } catch (e) {
    return reject(
      new Error('Could not parse input. Usage: `:param "x": 2`. ' + e)
    )
  }
}
export const handleParamsCommand = (action, cmdchar, put) => {
  const strippedCmd = action.cmd.substr(cmdchar.length)
  const parts = splitStringOnFirst(strippedCmd, ' ')
  const param = parts[1].trim()
  const p = new Promise((resolve, reject) => {
    if (/^"?\{[^}]*\}"?$/.test(param)) {
      // JSON object string {"x": 2, "y":"string"}
      try {
        const res = jsonic(param.replace(/^"/, '').replace(/"$/, '')) // Remove any surrounding quotes
        put(replace(res))
        return resolve({ result: res, type: 'params' })
      } catch (e) {
        return reject(
          new Error(
            'Could not parse input. Usage: `:params {"x":1,"y":"string"}`. ' + e
          )
        )
      }
    } else {
      // Single param
      const { key, value, isFn } = extractParams(param)
      if (!isFn || !key || !value) {
        return resolveAndStoreJsonValue(param, put, resolve, reject)
      }
      try {
        const cypherStatement = mapParamToCypherStatement(key, value)
        bolt
          .routedWriteTransaction(
            cypherStatement,
            {},
            {
              useCypherThread: false,
              requestId: action.requestId,
              cancelable: false
            }
          )
          .then(res => {
            let obj = {}
            res.records.forEach(record => {
              obj[key] = record.get(key)
            })
            const result = recursivelyTypeGraphItems(obj)
            put(update(result))
            resolve({ result, type: 'param' })
          })
          .catch(e => reject(e))
      } catch (e) {
        reject(new Error('Could not parse input. Usage: `:param "x": 2`. ' + e))
      }
    }
  })
  return p
}

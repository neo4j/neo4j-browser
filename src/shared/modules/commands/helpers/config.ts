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

import { splitStringOnFirst } from 'services/commandUtils'
import { getJSON } from 'services/remote'
import { hostIsAllowed } from 'services/utils'
import { isValidUrl } from 'shared/modules/commands/helpers/http'
import { getRemoteContentHostnameAllowlist } from 'shared/modules/dbMeta/dbMetaDuck'
import {
  getSettings,
  replace,
  update
} from 'shared/modules/settings/settingsDuck'

export function handleGetConfigCommand(_action: any, store: any) {
  const settingsState = getSettings(store.getState())
  const res = JSON.stringify(settingsState, null, 2)
  return { result: res, type: 'pre' }
}

export function handleUpdateConfigCommand(action: any, put: any, store: any) {
  const strippedCmd = action.cmd.substr(1)
  const parts = splitStringOnFirst(strippedCmd, ' ')
  const p = new Promise((resolve, reject) => {
    if (parts[1] === undefined || parts[1] === '') return resolve(true) // Nothing to do
    const param = parts[1].trim()
    if (!isValidUrl(param)) {
      // Not an URL. Parse as command line params
      if (/^"?\{[^}]*\}"?$/.test(param)) {
        // JSON object string {"x": 2, "y":"string"}
        try {
          const res = jsonic(param.replace(/^"/, '').replace(/"$/, '')) // Remove any surrounding quotes
          put(replace(res))
          return resolve(res)
        } catch (e) {
          return reject(
            new Error(
              `Could not parse input. Usage: \`:config {"x":1,"y":"string"}\`. ${e}`
            )
          )
        }
      } else {
        // Single param
        try {
          const json = `{${param}}`
          const res = jsonic(json)
          put(update(res))
          return resolve(res)
        } catch (e) {
          return reject(
            new Error(`Could not parse input. Usage: \`:config "x": 2\`. ${e}`)
          )
        }
      }
    }
    // It's an URL
    const allowlist = getRemoteContentHostnameAllowlist(store.getState())
    if (!hostIsAllowed(param, allowlist)) {
      // Make sure we're allowed to request entities on this host
      return reject(
        new Error('Hostname is not allowed according to server allowlist')
      )
    }
    getJSON(param)
      .then(res => {
        put(replace(res))
        resolve(res)
      })
      .catch(e => {
        reject(e)
      })
  })
  return p
}

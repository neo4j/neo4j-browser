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

import * as frames from 'shared/modules/stream/streamDuck'
import { getHostedUrl } from 'shared/modules/app/appDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { update as updateQueryResult } from 'shared/modules/requests/requestsDuck'
import { getActiveConnectionData } from 'shared/modules/connections/connectionsDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import {
  updateGraphStyleData,
  getGraphStyleData
} from 'shared/modules/grass/grassDuck'
import { getRemoteContentHostnameWhitelist } from 'shared/modules/dbMeta/dbMetaDuck'
import { fetchRemoteGuide } from 'shared/modules/commands/helpers/play'
import remote from 'services/remote'
import bolt from 'services/bolt/bolt'
import { isLocalRequest, authHeaderFromCredentials } from 'services/remoteUtils'
import { handleServerCommand } from 'shared/modules/commands/helpers/server'
import { handleCypherCommand } from 'shared/modules/commands/helpers/cypher'
import {
  unknownCommand,
  showErrorMessage,
  cypher,
  successfulCypher,
  unsuccessfulCypher
} from 'shared/modules/commands/commandsDuck'
import { handleParamsCommand } from 'shared/modules/commands/helpers/params'
import {
  handleGetConfigCommand,
  handleUpdateConfigCommand
} from 'shared/modules/commands/helpers/config'
import {
  CouldNotFetchRemoteGuideError,
  FetchURLError
} from 'services/exceptions'
import {
  parseHttpVerbCommand,
  isValidURL
} from 'shared/modules/commands/helpers/http'
import {
  fetchRemoteGrass,
  parseGrass
} from 'shared/modules/commands/helpers/grass'
import { shouldUseCypherThread } from 'shared/modules/settings/settingsDuck'

const availableCommands = [
  {
    name: 'clear',
    match: cmd => cmd === 'clear',
    exec: function (action, cmdchar, put) {
      put(frames.clear())
    }
  },
  {
    name: 'config',
    match: cmd => /^config(\s|$)/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      handleUpdateConfigCommand(action, cmdchar, put, store)
        .then(res => {
          put(
            frames.add({
              ...action,
              ...handleGetConfigCommand(action, cmdchar, store)
            })
          )
        })
        .catch(e => {
          put(showErrorMessage(e.message))
        })
    }
  },
  {
    name: 'set-params',
    match: cmd => /^params?\s/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      handleParamsCommand(action, cmdchar, put, bolt)
        .then(res => {
          const params =
            res.type === 'param' ? res.result : getParams(store.getState())
          put(frames.add({ ...action, type: res.type, success: true, params }))
        })
        .catch(e => {
          put(showErrorMessage(e.message))
        })
    }
  },
  {
    name: 'params',
    match: cmd => /^params$/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      put(
        frames.add({
          ...action,
          type: 'params',
          params: getParams(store.getState())
        })
      )
    }
  },
  {
    name: 'schema',
    match: cmd => /^schema$/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      put(frames.add({ ...action, type: 'schema' }))
    }
  },
  {
    name: 'sysinfo',
    match: cmd => /^sysinfo$/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      put(frames.add({ ...action, type: 'sysinfo' }))
    }
  },
  {
    name: 'cypher',
    match: cmd => /^cypher$/.test(cmd),
    exec: (action, cmdchar, put, store) => {
      const state = store.getState()
      const [id, request] = handleCypherCommand(
        action,
        put,
        getParams(state),
        shouldUseCypherThread(state)
      )
      put(cypher(action.cmd))
      put(frames.add({ ...action, type: 'cypher', requestId: id }))
      return request
        .then(res => {
          put(updateQueryResult(id, res, 'success'))
          put(successfulCypher(action.cmd))
          return res
        })
        .catch(function (e) {
          put(updateQueryResult(id, e, 'error'))
          put(unsuccessfulCypher(action.cmd))
          throw e
        })
    }
  },
  {
    name: 'server',
    match: cmd => /^server(\s)/.test(cmd),
    exec: (action, cmdchar, put, store) => {
      const response = handleServerCommand(action, cmdchar, put, store)
      if (response && response.then) {
        response.then(res => {
          if (res) put(frames.add({ ...action, ...res }))
        })
      } else if (response) {
        put(frames.add({ ...action, ...response }))
      }
      return response
    }
  },
  {
    name: 'play-remote',
    match: cmd => /^play(\s|$)https?/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      const url = action.cmd.substr(cmdchar.length + 'play '.length)
      const whitelist = getRemoteContentHostnameWhitelist(store.getState())
      fetchRemoteGuide(url, whitelist)
        .then(r => {
          put(frames.add({ ...action, type: 'play-remote', result: r }))
        })
        .catch(e => {
          put(
            frames.add({
              ...action,
              type: 'play-remote',
              response: e.response || null,
              error: CouldNotFetchRemoteGuideError(e.name + ': ' + e.message)
            })
          )
        })
    }
  },
  {
    name: 'play',
    match: cmd => /^play(\s|$)/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      put(frames.add({ ...action, type: 'play' }))
    }
  },
  {
    name: 'history',
    match: cmd => cmd === 'history',
    exec: function (action, cmdchar, put, store) {
      const historyState = getHistory(store.getState())
      const newAction = frames.add({
        ...action,
        result: historyState,
        type: 'history'
      })
      put(newAction)
      return newAction
    }
  },
  {
    name: 'queries',
    match: cmd => cmd === 'queries',
    exec: (action, cmdchar, put, store) => {
      put(
        frames.add({
          ...action,
          type: 'queries',
          result: "{res : 'QUERIES RESULT'}"
        })
      )
    }
  },
  {
    name: 'help',
    match: cmd => /^help(\s|$)/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      put(frames.add({ ...action, type: 'help' }))
    }
  },
  {
    name: 'http',
    match: cmd => /^(get|post|put|delete|head)/i.test(cmd),
    exec: (action, cmdchar, put, store) => {
      return parseHttpVerbCommand(action.cmd)
        .then(r => {
          const hostedUrl = getHostedUrl(store.getState())
          const isLocal = isLocalRequest(hostedUrl, r.url, {
            hostnameOnly: false
          })
          const connectionData = getActiveConnectionData(store.getState())
          const isSameHostnameAsConnection = isLocalRequest(
            connectionData.host,
            r.url,
            { hostnameOnly: true }
          )
          const url =
            !isValidURL(r.url) && connectionData.restApi
              ? `${connectionData.restApi}${r.url}`
              : r.url
          let authHeaders = {}
          if (isLocal || isSameHostnameAsConnection) {
            if (connectionData.username) {
              authHeaders = {
                Authorization:
                  'Basic ' +
                  authHeaderFromCredentials(
                    connectionData.username,
                    connectionData.password
                  )
              }
            }
          }
          remote
            .request(r.method, url, r.data, authHeaders)
            .then(res => res.text())
            .then(res => {
              put(frames.add({ ...action, result: res, type: 'pre' }))
            })
            .catch(e => {
              const error = new FetchURLError(e.message)
              put(frames.add({ ...action, error, type: 'error' }))
            })
        })
        .catch(error => {
          put(frames.add({ ...action, error, type: 'error' }))
        })
    }
  },
  {
    name: 'style',
    match: cmd => /^style(\s|$)/.test(cmd),
    exec: function (action, cmdchar, put, store) {
      const match = action.cmd.match(/:style\s*(\S.*)$/)
      let param = match && match[1] ? match[1] : ''

      if (param === '') {
        const grassData = JSON.stringify(
          getGraphStyleData(store.getState()),
          null,
          2
        )
        put(frames.add({ ...action, type: 'pre', result: grassData }))
      } else if (param === 'reset') {
        put(updateGraphStyleData(null))
      } else if (isValidURL(param)) {
        if (!param.startsWith('http')) {
          param = 'http://' + param
        }

        const whitelist = getRemoteContentHostnameWhitelist(store.getState())
        fetchRemoteGrass(param, whitelist)
          .then(response => {
            const parsedGrass = parseGrass(response)
            if (parsedGrass) {
              put(updateGraphStyleData(parsedGrass))
            } else {
              put(showErrorMessage('Could not parse grass file'))
            }
          })
          .catch(e => {
            const error = new Error(e)
            put(frames.add({ ...action, error, type: 'error' }))
          })
      } else {
        const parsedGrass = parseGrass(param)
        if (parsedGrass) {
          put(updateGraphStyleData(parsedGrass))
        } else {
          put(showErrorMessage('Could not parse grass data'))
        }
      }
    }
  },
  {
    name: 'catch-all',
    match: () => true,
    exec: (action, cmdchar, put) => {
      put(unknownCommand(action.cmd))
    }
  }
]

// First to match wins
const interpret = cmd => {
  return availableCommands.reduce((match, candidate) => {
    if (match) return match
    const isMatch = candidate.match(cmd.toLowerCase())
    return isMatch ? candidate : null
  }, null)
}

export default {
  interpret,
  commands: availableCommands.map(command => command.name)
}

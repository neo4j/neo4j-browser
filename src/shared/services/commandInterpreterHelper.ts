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
import * as Sentry from '@sentry/react'
import { AUTH_STORAGE_LOGS } from 'neo4j-client-sso'
import { Action, Dispatch } from 'redux'
import { v4 } from 'uuid'

import { getCommandAndParam } from './commandUtils'
import { tryGetRemoteInitialSlideFromUrl } from './guideResolverHelper'
import { unescapeCypherIdentifier } from './utils'
import { getLatestFromFrameStack } from 'browser/modules/Stream/stream.utils'
import bolt from 'services/bolt/bolt'
import {
  CouldNotFetchRemoteGuideError,
  DatabaseNotFoundError,
  DatabaseUnavailableError,
  FetchUrlError,
  InvalidGrassError,
  UnknownCommandError,
  UnsupportedError
} from 'services/exceptions'
import remote from 'services/remote'
import { authHeaderFromCredentials, isLocalRequest } from 'services/remoteUtils'
import { getHostedUrl } from 'shared/modules/app/appDuck'
import {
  ExecuteSingleCommandAction,
  SINGLE_COMMAND_QUEUED,
  autoCommitTxCommand,
  listDbsCommand,
  showErrorMessage,
  successfulCypher,
  unsuccessfulCypher,
  useDbCommand
} from 'shared/modules/commands/commandsDuck'
import {
  handleGetConfigCommand,
  handleUpdateConfigCommand
} from 'shared/modules/commands/helpers/config'
import { handleCypherCommand } from 'shared/modules/commands/helpers/cypher'
import { fetchRemoteGrass } from 'shared/modules/commands/helpers/grass'
import {
  isValidUrl,
  parseHttpVerbCommand
} from 'shared/modules/commands/helpers/http'
import {
  getParamName,
  handleParamsCommand
} from 'shared/modules/commands/helpers/params'
import { fetchRemoteGuideAsync } from 'shared/modules/commands/helpers/playAndGuides'
import { handleServerCommand } from 'shared/modules/commands/helpers/server'
import {
  getActiveConnectionData,
  getUseDb,
  useDb
} from 'shared/modules/connections/connectionsDuck'
import {
  fetchMetaData,
  findDatabaseByNameOrAlias,
  getAvailableSettings,
  getDatabases,
  getRemoteContentHostnameAllowlist,
  SYSTEM_DB
} from 'shared/modules/dbMeta/dbMetaDuck'
import { getUserCapabilities } from 'shared/modules/features/featuresDuck'
import * as frames from 'shared/modules/frames/framesDuck'
import {
  getGraphStyleData,
  updateGraphStyleData
} from 'shared/modules/grass/grassDuck'
import { fetchRemoteGuide, resetGuide } from 'shared/modules/guides/guidesDuck'
import { clearHistory, getHistory } from 'shared/modules/history/historyDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import {
  REQUEST_STATUS_ERROR,
  REQUEST_STATUS_PENDING,
  REQUEST_STATUS_SUCCESS,
  getRequest,
  update as updateQueryResult
} from 'shared/modules/requests/requestsDuck'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import { open } from 'shared/modules/sidebar/sidebarDuck'
import {
  backgroundTxMetadata,
  userDirectTxMetadata
} from 'shared/services/bolt/txMetadata'
import { objToCss, parseGrass } from 'shared/services/grassUtils'
import { URL } from 'whatwg-url'

const PLAY_FRAME_TYPES = ['play', 'play-remote']

const availableCommands = [
  {
    name: 'clear',
    match: (cmd: any) => cmd === 'clear',
    exec(_action: any, put: any) {
      put(frames.clear())
    }
  },
  {
    name: 'noop',
    match: (cmd: any) => /^noop$/.test(cmd),
    exec(action: any, put: any, store: any) {
      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          type: 'noop'
        })
      )
      return true
    }
  },
  {
    name: 'config',
    match: (cmd: any) => /^config(\s|$)/.test(cmd),
    exec(action: any, put: any, store: any) {
      handleUpdateConfigCommand(action, put, store)
        .then(() => {
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              ...handleGetConfigCommand(action, store)
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
    match: (cmd: any) => /^params?\s/.test(cmd),
    exec(action: any, put: any, store: any) {
      return handleParamsCommand(action, put, getUseDb(store.getState()))
        .then(res => {
          const params =
            res.type === 'param' ? res.result : getParams(store.getState())
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              type: res.type,
              success: true,
              params
            })
          )
          put(updateQueryResult(action.requestId, res as any, 'success'))
          return true
        })
        .catch(error => {
          // Don't show error message if it's a sub command
          if (!action.parentId) {
            put(
              frames.add({
                useDb: getUseDb(store.getState()),
                ...action,
                error: {
                  type: 'Syntax Error',
                  message: error.message.replace(/^Error: /, '')
                },
                showHelpForCmd: getParamName(action),
                type: 'error'
              })
            )
          }
          put(updateQueryResult(action.requestId, error, 'error'))
          throw error
        })
    }
  },
  {
    name: 'params',
    match: (cmd: any) => /^params$/.test(cmd),
    exec(action: any, put: any, store: any) {
      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          type: 'params',
          params: getParams(store.getState())
        })
      )
    }
  },
  {
    name: 'use-db',
    match: (cmd: any) => new RegExp(`^${useDbCommand}\\s[^$]+$`).test(cmd),
    async exec(action: any, put: any, store: any): Promise<any> {
      const [dbName] = getCommandAndParam(action.cmd.substr(1))
      try {
        const supportsMultiDb = await bolt.hasMultiDbSupport()
        if (!supportsMultiDb) {
          throw UnsupportedError('No multi db support detected.')
        }

        const normalizedName = dbName.toLowerCase()
        const cleanDbName = unescapeCypherIdentifier(normalizedName)
        const dbMeta = findDatabaseByNameOrAlias(store.getState(), cleanDbName)

        if (!dbMeta) {
          throw DatabaseNotFoundError({ dbName })
        }
        if (dbMeta.status !== 'online') {
          throw DatabaseUnavailableError({ dbName: dbMeta.name, dbMeta })
        }
        put(useDb(dbMeta.name))
        put(
          frames.add({
            ...action,
            type: 'use-db',
            useDb: dbMeta.name
          })
        )
        if (action.requestId) {
          put(updateQueryResult(action.requestId, null, 'success'))
        }
        return true
      } catch (error) {
        if (!action.parentId) {
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              type: 'error',
              error
            })
          )
        }
        if (action.requestId) {
          put(updateQueryResult(action.requestId, error, 'error'))
        }
      }
    }
  },
  {
    name: 'reset-db',
    match: (cmd: any) => new RegExp(`^${useDbCommand}$`).test(cmd),
    exec(action: any, put: any, store: any) {
      return bolt
        .hasMultiDbSupport()
        .then(supportsMultiDb => {
          if (supportsMultiDb) {
            put(useDb(null))
            put(fetchMetaData())
            put(
              frames.add({
                useDb: getUseDb(store.getState()),
                ...action,
                type: 'reset-db'
              })
            )
          } else {
            put(
              frames.add({
                useDb: getUseDb(store.getState()),
                ...action,
                type: 'error',
                error: UnsupportedError('No multi db support detected.')
              })
            )
          }
        })
        .catch(() => undefined)
    }
  },
  {
    name: 'dbs',
    match: (cmd: any) => new RegExp(`^${listDbsCommand}$`).test(cmd),
    exec(action: any, put: any, store: any) {
      bolt
        .hasMultiDbSupport()
        .then(supportsMultiDb => {
          if (supportsMultiDb) {
            put(
              frames.add({
                useDb: getUseDb(store.getState()),
                ...action,
                type: 'dbs',
                dbs: getDatabases(store.getState())
              })
            )
          } else {
            put(
              frames.add({
                useDb: getUseDb(store.getState()),
                ...action,
                type: 'error',
                error: UnsupportedError('No multi db support detected.')
              })
            )
          }
        })
        .catch(() => undefined)
    }
  },
  {
    name: 'schema',
    match: (cmd: any) => /^schema$/.test(cmd),
    exec(action: any, put: any, store: any) {
      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          type: 'schema',
          schemaRequestId: v4()
        })
      )
    }
  },
  {
    name: 'client-debug',
    match: (cmd: any) => /^debug$/.test(cmd),
    exec: function (action: any, put: any, store: any) {
      const out = {
        userCapabilities: getUserCapabilities(store.getState()),
        serverConfig: getAvailableSettings(store.getState()),
        browserSettings: getSettings(store.getState()),
        ssoLogs: sessionStorage.getItem(AUTH_STORAGE_LOGS)?.trim().split('\n')
      }
      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          type: 'pre',
          contents: JSON.stringify(out, null, 2)
        })
      )
    }
  },
  {
    name: 'sysinfo',
    match: (cmd: any) => /^sysinfo$/.test(cmd),
    exec(action: any, put: any, store: any) {
      const useDb = getUseDb(store.getState())
      if (useDb === SYSTEM_DB) {
        put(
          frames.add({
            useDb,
            ...action,
            type: 'error',
            error: UnsupportedError(
              'The :sysinfo command is not supported while using the system database.'
            )
          })
        )
      } else {
        put(
          frames.add({
            useDb,
            ...action,
            type: 'sysinfo'
          })
        )
      }
    }
  },
  {
    name: 'cypher',
    match: (cmd: any) =>
      /^cypher$/.test(cmd) ||
      new RegExp(`^${autoCommitTxCommand}`, 'i').test(cmd),
    exec: (action: any, put: any, store: any) => {
      // Sentry crashes tests without the ?. when it's not been initiated
      const transaction = Sentry.startTransaction({
        name: 'performance/cypher-query'
      })
      const startingRequest = transaction?.startChild({
        op: 'Starting request and dispatching'
      })

      const state = store.getState()

      // Since we now also handle queries with the :auto prefix,
      // we need to strip that and attach to the actions object
      const query = action.cmd.trim()

      const autoPrefix = `:${autoCommitTxCommand} `
      const blankedComments = query
        .replace(/\/\*(.|\n)*?\*\//g, (match: any) => ' '.repeat(match.length)) // mutliline comment
        .replace(/\/\/[^\n]*\n/g, (match: any) => ' '.repeat(match.length)) // singleline comment

      const isAutocommit = blankedComments.trim().startsWith(autoPrefix)
      action.autoCommit = isAutocommit

      const prefixIndex = blankedComments.indexOf(autoPrefix)
      const withoutAutoPrefix =
        query.substring(0, prefixIndex) +
        query.substring(prefixIndex + autoPrefix.length)

      action.query = isAutocommit ? withoutAutoPrefix : query

      const [id, request] = handleCypherCommand(
        action,
        put,
        getParams(state),
        action.type === SINGLE_COMMAND_QUEUED
          ? userDirectTxMetadata
          : backgroundTxMetadata,
        isAutocommit
      )
      put(
        frames.add({
          ...action,
          useDb: action.useDb || getUseDb(store.getState()),
          type: 'cypher',
          requestId: id
        })
      )
      startingRequest?.finish()
      const finishRequestSpan = transaction?.startChild({
        op: 'Resolve request',
        description:
          'Time from all actions dispatched until request is resolved'
      })
      return request
        .then((res: any) => {
          put(updateQueryResult(id, res, REQUEST_STATUS_SUCCESS))
          put(successfulCypher(action.cmd))
          return res
        })
        .catch((e: any) => {
          const request = getRequest(store.getState(), id)
          // Only update error statuses for pending queries
          if (request.status !== REQUEST_STATUS_PENDING) {
            return
          }
          put(updateQueryResult(id, e, REQUEST_STATUS_ERROR))
          put(unsuccessfulCypher(action.cmd))
          throw e
        })
        .finally(() => {
          put(fetchMetaData())
          finishRequestSpan?.finish()
          transaction?.finish()
        })
    }
  },
  {
    name: 'server',
    match: (cmd: any) => /^server(\s)/.test(cmd),
    exec: (action: any, put: any, store: any) => {
      const response = handleServerCommand(action, put, store)
      if (response) {
        if (response.then) {
          response.then((res: any) => {
            if (res) {
              put(
                frames.add({
                  useDb: getUseDb(store.getState()),
                  ...action,
                  ...res
                })
              )
            }
          })
        } else
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              ...response
            })
          )
        return response
      }
    }
  },
  {
    name: 'guide',
    match: (cmd: string) => /^guide(\s|$)/.test(cmd),
    exec(action: ExecuteSingleCommandAction, dispatch: Dispatch<Action>) {
      const guideIdentifier = action.cmd.substr(':guide'.length).trim()
      if (!guideIdentifier) {
        dispatch(resetGuide())
        dispatch(open('guides'))
        return
      }

      dispatch(fetchRemoteGuide(guideIdentifier))
    }
  },
  {
    name: 'play-remote',
    match: (cmd: any) => /^play(\s|$)https?/.test(cmd),
    exec(action: any, put: any, store: any) {
      let id: any
      // We have a frame that generated this command
      if (action.id) {
        const originFrame = frames.getFrame(store.getState(), action.id)
        // Only replace when the origin is a play frame or the frame is reused
        if (originFrame) {
          const latest = getLatestFromFrameStack(originFrame)
          if (
            (latest && PLAY_FRAME_TYPES.includes(latest.type)) ||
            action.isRerun
          ) {
            id = action.id
          }
        } else {
          // New id === new frame
          id = v4()
        }
      }

      const url = action.cmd.substr(':play '.length)
      const urlObject = new URL(url)
      urlObject.href = url
      const filenameExtension = urlObject.pathname.includes('.')
        ? urlObject.pathname.split('.').pop()
        : 'html'
      const allowlist = getRemoteContentHostnameAllowlist(store.getState())
      fetchRemoteGuideAsync(url, allowlist)
        .then(r => {
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              filenameExtension,
              id,
              type: 'play-remote',
              initialSlide: tryGetRemoteInitialSlideFromUrl(url),
              result: r
            })
          )
        })
        .catch(e => {
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              filenameExtension,
              id,
              type: 'play-remote',
              response: e.response || null,
              initialSlide: tryGetRemoteInitialSlideFromUrl(url),
              error: CouldNotFetchRemoteGuideError({
                error: `${e.name}: ${e.message}`
              })
            })
          )
        })
    }
  },
  {
    name: 'play',
    match: (cmd: any) => /^play(\s|$)/.test(cmd),
    exec(action: any, put: any, store: any) {
      /* Un pause when tests are fixed
      // Built in play guides where migrated to
      // use the guide command instead
      const legacyBuiltInGuides: GuideChapter[] = [
        'concepts',
        'cypher',
        'intro',
        'movies',
        'movieGraph',
        'movie-graph',
        'northwind',
        'northwindGraph',
        'northwind-graph'
      ]

      const guideName = (action.cmd.split(' ')[1] || '').trim()

      if (legacyBuiltInGuides.includes(guideName)) {
        put(executeCommand(`:guide ${guideName}`))
        return
      }
      */

      let id
      // We have a frame that generated this command
      if (action.id) {
        const originFrame = frames.getFrame(store.getState(), action.id)
        // Only replace when the origin is a play frame or the frame is reused
        if (originFrame) {
          const latest = getLatestFromFrameStack(originFrame)
          if (
            (latest && PLAY_FRAME_TYPES.includes(latest.type)) ||
            action.isRerun
          ) {
            id = action.id
          }
        } else {
          // New id === new frame
          id = v4()
        }
      }

      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          id,
          initialSlide: tryGetRemoteInitialSlideFromUrl(action.cmd),
          type: 'play'
        })
      )
    }
  },
  {
    name: 'history',
    match: (cmd: any) => /^history(\s+clear)?/.test(cmd),
    exec(action: any, put: any, store: any) {
      const match = action.cmd
        .trim()
        .toLowerCase()
        .match(/^:history(\s+clear)?/)
      if (match[0] !== match.input) {
        return put(
          frames.add({
            useDb: getUseDb(store.getState()),
            ...action,
            error: UnknownCommandError(action),
            type: 'error'
          })
        )
      }

      if (match[1]) {
        put(clearHistory())
      }

      const historyState = getHistory(store.getState())
      const newAction = frames.add({
        useDb: getUseDb(store.getState()),
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
    match: (cmd: any) => cmd === 'queries',
    exec: (action: any, put: any, store: any) => {
      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          type: 'queries',
          result: "{res : 'QUERIES RESULT'}"
        })
      )
    }
  },
  {
    name: 'help',
    match: (cmd: any) => /^(help|\?)(\s|$)/.test(cmd),
    exec(action: any, put: any, store: any) {
      const HELP_FRAME_TYPE = 'help'
      let id

      // We have a frame that generated this command
      if (action.id) {
        const originFrame = frames.getFrame(store.getState(), action.id)
        // Only replace when the origin is a help frame or re-run command
        if (originFrame) {
          const latest = getLatestFromFrameStack(originFrame)
          if ((latest && latest.type === HELP_FRAME_TYPE) || action.isRerun) {
            id = action.id
          }
        } else {
          // New id === new frame
          id = v4()
        }
      }

      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          id,
          type: 'help'
        })
      )
    }
  },
  {
    name: 'http',
    match: (cmd: any) => /^(get|post|put|delete|head)/i.test(cmd),
    exec: (action: any, put: any, store: any) => {
      return parseHttpVerbCommand(action.cmd)
        .then((r: any) => {
          const hostedUrl = getHostedUrl(store.getState())
          const isLocal = isLocalRequest(hostedUrl, r.url, {
            hostnameOnly: false
          })
          const connectionData = getActiveConnectionData(store.getState())
          if (!connectionData) {
            throw new Error('No connection')
          }
          const isSameHostnameAsConnection = isLocalRequest(
            connectionData.host,
            r.url,
            {
              hostnameOnly: true
            }
          )
          const url =
            !isValidUrl(r.url) && connectionData.restApi
              ? `${connectionData.restApi}${r.url}`
              : r.url
          let authHeaders = {}
          if (isLocal || isSameHostnameAsConnection) {
            if (connectionData.username) {
              authHeaders = {
                Authorization: `Basic ${authHeaderFromCredentials(
                  connectionData.username,
                  connectionData.password
                )}`
              }
            }
          }
          remote
            .request(r.method, url, r.data, authHeaders)
            .then(res => res.text())
            .then(res => {
              put(
                frames.add({
                  useDb: getUseDb(store.getState()),
                  ...action,
                  result: res,
                  type: 'pre'
                })
              )
            })
            .catch(e => {
              const error = FetchUrlError({ error: e.message })
              put(
                frames.add({
                  useDb: getUseDb(store.getState()),
                  ...action,
                  error,
                  type: 'error'
                })
              )
            })
        })
        .catch(error => {
          put(
            frames.add({
              useDb: getUseDb(store.getState()),
              ...action,
              error,
              type: 'error'
            })
          )
        })
    }
  },
  {
    name: 'style',
    match: (cmd: any) => /^style(\s|$)/.test(cmd),
    exec(action: any, put: any, store: any) {
      const param = action.cmd.trim().split(':style')[1].trim()

      function showGrass() {
        const grassData = getGraphStyleData(store.getState())
        put(
          frames.add({
            useDb: getUseDb(store.getState()),
            ...action,
            type: 'style',
            result: grassData
          })
        )
      }

      function updateAndShowGrass(newGrass: any) {
        put(updateGraphStyleData(newGrass))
        showGrass()
      }

      function putGrassErrorFrame(message: any) {
        put(
          frames.add({
            useDb: getUseDb(store.getState()),
            ...action,
            error: InvalidGrassError(message),
            type: 'error'
          })
        )
      }

      if (param === '') {
        showGrass()
        return
      }

      if (param === 'reset') {
        updateAndShowGrass(null)
        return
      }

      if (
        isValidUrl(param) &&
        param.includes('.') /* isValid url considers words like rest an url*/
      ) {
        const url = param.startsWith('http') ? param : `http://${param}`
        const allowlist = getRemoteContentHostnameAllowlist(store.getState())

        fetchRemoteGrass(url, allowlist)
          .then(response => {
            const parsedGrass = parseGrass(response)
            if (parsedGrass) {
              updateAndShowGrass(parsedGrass)
            } else {
              putGrassErrorFrame(
                `Could not parse grass file containing:
${response}`
              )
            }
          })
          .catch(e => putGrassErrorFrame(e.message))
        return
      }

      // Some dummy data like 23432432 will parse as "valid grass"
      // try to convert to css to see if actually valid
      const parsedGrass = parseGrass(param)
      const validGrass = objToCss(parsedGrass)
      if (parsedGrass && validGrass) {
        updateAndShowGrass(parsedGrass)
      } else {
        putGrassErrorFrame(`Could not parse grass data:
${param}`)
      }
    }
  },
  {
    name: 'catch-all',
    match: () => true,
    exec: (action: any, put: any, store: any) => {
      put(
        frames.add({
          useDb: getUseDb(store.getState()),
          ...action,
          error: UnknownCommandError(action),
          type: 'error'
        })
      )
    }
  }
]

// First to match wins
const interpret = (cmd: string) => {
  return availableCommands.reduce((match: any, candidate) => {
    if (match) return match
    const isMatch = candidate.match(cmd.toLowerCase().trim())
    return isMatch ? candidate : null
  }, null)
}

export default {
  interpret,
  commands: availableCommands.map(command => command.name)
}

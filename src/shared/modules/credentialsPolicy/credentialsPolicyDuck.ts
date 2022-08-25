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
import { parseTimeMillis } from 'services/utils'
import {
  disconnectAction,
  getActiveConnection
} from 'shared/modules/connections/connectionsDuck'
import { credentialsTimeout } from 'shared/modules/dbMeta/dbMetaDuck'
import { USER_INTERACTION } from 'shared/modules/userInteraction/userInteractionDuck'

// Local variables (used in epics)
let timer: any = null

export const NAME = `credentialsPolicy`
export const TRIGGER_CREDENTIALS_TIMEOUT = `${NAME}/TRIGGER_CREDENTIALS_TIMEOUT`
export const triggerCredentialsTimeout = () => {
  return { type: TRIGGER_CREDENTIALS_TIMEOUT }
}

// Epics
export const credentialsTimeoutEpic = (action$: any, store: any) =>
  action$
    .ofType(TRIGGER_CREDENTIALS_TIMEOUT)
    .merge(action$.ofType(USER_INTERACTION))
    .do(() => {
      const cTimeout = parseTimeMillis(credentialsTimeout(store.getState()))
      if (!cTimeout) return clearTimeout(timer)
      clearTimeout(timer)
      timer = setTimeout(() => {
        const activeConnection = getActiveConnection(store.getState())
        if (activeConnection) {
          store.dispatch(disconnectAction(activeConnection))
        }
      }, cTimeout)
    })
    .ignoreElements()

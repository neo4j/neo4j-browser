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

import { USER_INTERACTION } from 'shared/modules/userInteraction/userInteractionDuck'
import { credentialsTimeout } from 'shared/modules/dbMeta/dbMetaDuck'
import {
  disconnectAction,
  getActiveConnection
} from 'shared/modules/connections/connectionsDuck'
import { parseTimeMillis } from 'services/utils'

// Local variables (used in epics)
let timer = null

// Epics
export const credentialsTimeoutEpic = (action$, store) =>
  action$
    .ofType(USER_INTERACTION)
    .do(action => {
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
    .mapTo({ type: 'NOOP' })

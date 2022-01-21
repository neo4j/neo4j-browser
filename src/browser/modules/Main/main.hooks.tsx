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
 *
 */
import { useEffect, useState } from 'react'

import {
  CONNECTING_STATE,
  PENDING_STATE
} from 'shared/modules/connections/connectionsDuck'

const FIVE_SECONDS = 5 * 1000
const TEN_SECONDS = 10 * 1000

export function useSlowConnectionState({
  connectionState,
  errorMessage,
  lastConnectionUpdate
}: {
  connectionState: number
  errorMessage?: string
  lastConnectionUpdate: number
}): [boolean, boolean] {
  const [past5Sec, setPast5Sec] = useState(false)
  const [past10Sec, setPast10Sec] = useState(false)

  useEffect(() => {
    const shouldTimeConnection =
      [CONNECTING_STATE, PENDING_STATE].includes(connectionState) &&
      !errorMessage

    if (!shouldTimeConnection) {
      setPast5Sec(false)
      setPast10Sec(false)

      return
    }

    const timeout5Sec = setTimeout(() => {
      const diff = Date.now() - lastConnectionUpdate

      setPast5Sec(diff > FIVE_SECONDS)
    }, FIVE_SECONDS)

    const timeout10Sec = setTimeout(() => {
      const diff = Date.now() - lastConnectionUpdate

      setPast10Sec(diff > TEN_SECONDS)
    }, TEN_SECONDS)

    return () => {
      clearTimeout(timeout5Sec)
      clearTimeout(timeout10Sec)
    }
  }, [connectionState, lastConnectionUpdate, errorMessage])

  return [past5Sec, past10Sec]
}

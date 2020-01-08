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
 *
 */

import { useState, useEffect } from 'react'

import {
  PENDING_STATE,
  CONNECTING_STATE
} from 'shared/modules/connections/connectionsDuck'

/**
 * Custom hook for detecting slow connections
 * @param     {object}      props
 * @param     {number}      props.connectionState
 * @param     {string}      props.errorMessage
 * @param     {number}      props.lastConnectionUpdate
 * @return    {boolean[]}
 */
export function useSlowConnectionState({
  connectionState,
  errorMessage,
  lastConnectionUpdate
}) {
  const [past5Sec, setPast5Sec] = useState(false)
  const [past10Sec, setPast10Sec] = useState(false)
  const DELAY_5SEC = 5 * 1000 // five seconds
  const DELAY_10SEC = 10 * 1000 // ten seconds
  const shouldTimeConnection = () =>
    [CONNECTING_STATE, PENDING_STATE].includes(connectionState) && !errorMessage
  let timeout5Sec = null
  let timeout10Sec = null

  useEffect(() => {
    if (!shouldTimeConnection()) {
      clearTimeout(timeout5Sec)
      clearTimeout(timeout10Sec)
      setPast5Sec(false)
      setPast10Sec(false)

      return
    }

    timeout5Sec = setTimeout(() => {
      const diff = Date.now() - lastConnectionUpdate

      setPast5Sec(diff > DELAY_5SEC)
    }, DELAY_5SEC)
    timeout10Sec = setTimeout(() => {
      const diff = Date.now() - lastConnectionUpdate

      setPast10Sec(diff > DELAY_10SEC)
    }, DELAY_10SEC)

    return () => {
      clearTimeout(timeout5Sec)
      clearTimeout(timeout10Sec)
    }
  }, [connectionState, lastConnectionUpdate])

  return [past5Sec, past10Sec]
}

/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { useEffect } from 'react'
import { withBus } from 'react-suber'
import {
  useWorkspaceData,
  useWorkspaceDataOnChange,
  useActiveGraphMonitor,
  usePrefersColorSchemeMonitor
} from './relate-api.hooks'
import {
  getActiveGraphData,
  getPrefersColorScheme,
  detectDesktopThemeChanges,
  switchConnection,
  setInitialConnectionData
} from './relate-api.utils'
import { SILENT_DISCONNECT } from 'shared/modules/connections/connectionsDuck'

function RelateApi ({ setEnvironmentTheme, defaultConnectionData, bus = {} }) {
  // Until supported in relate-api
  const getKerberosTicket =
    (window.neo4jDesktopApi || {}).getKerberosTicket || function () {}

  // Initial data from Relate-API
  const workspaceData = useWorkspaceData()
  useEffect(
    () => {
      if (!workspaceData) {
        return
      }
      const activeGraph = getActiveGraphData(workspaceData)
      setInitialConnectionData(
        activeGraph,
        getKerberosTicket,
        defaultConnectionData,
        bus
      )
      detectDesktopThemeChanges(
        setEnvironmentTheme,
        getPrefersColorScheme(workspaceData)
      )
    },
    [workspaceData]
  )

  // Subscriptions from Relate-API
  const onWorkspaceChangeData = useWorkspaceDataOnChange()

  const activeGraphMonitorData = useActiveGraphMonitor(onWorkspaceChangeData)
  useEffect(
    () => {
      if (activeGraphMonitorData === undefined) {
        // Not loaded yet
        return
      }
      if (activeGraphMonitorData === null) {
        bus.send(SILENT_DISCONNECT, {})
        return
      }
      switchConnection(
        activeGraphMonitorData,
        defaultConnectionData,
        getKerberosTicket,
        bus
      )
    },
    [activeGraphMonitorData]
  )

  const prefersColorSchemeMonitorData = usePrefersColorSchemeMonitor(
    onWorkspaceChangeData
  )
  useEffect(
    () => {
      detectDesktopThemeChanges(
        setEnvironmentTheme,
        prefersColorSchemeMonitorData
      )
    },
    [prefersColorSchemeMonitorData]
  )

  return null
}

export default withBus(RelateApi)

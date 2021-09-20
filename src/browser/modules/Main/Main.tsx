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
import React from 'react'
import {
  DISCONNECTED_STATE,
  PENDING_STATE,
  CONNECTING_STATE
} from 'shared/modules/connections/connectionsDuck'
import Editor from '../Editor/MainEditor'
import Stream from '../Stream/Stream'

import {
  StyledMain,
  WarningBanner,
  ErrorBanner,
  NotAuthedBanner
} from './styled'
import ErrorBoundary from 'browser-components/ErrorBoundary'
import { useSlowConnectionState } from './main.hooks'
import AutoExecButton from '../Stream/auto-exec-button'

const Main = React.memo(function Main(props: any) {
  const [past5Sec, past10Sec] = useSlowConnectionState(props)
  const { databases, useDb } = props
  const dbMeta = databases && databases.find((db: any) => db.name === useDb)
  const dbIsUnavailable = useDb && (!dbMeta || dbMeta.status !== 'online')

  return (
    <StyledMain data-testid="main">
      <ErrorBoundary>
        <Editor />
      </ErrorBoundary>
      {dbIsUnavailable && (
        <ErrorBanner>
          Database '{useDb}' is unavailable. Run{' '}
          <AutoExecButton cmd="sysinfo" /> for more info.
        </ErrorBanner>
      )}
      {props.errorMessage && (
        <ErrorBanner data-testid="errorBanner">
          {props.errorMessage}
        </ErrorBanner>
      )}
      {props.connectionState === DISCONNECTED_STATE && (
        <NotAuthedBanner data-testid="disconnectedBanner">
          Database access not available. Please use&nbsp;
          <AutoExecButton
            cmd="server connect"
            data-testid="disconnectedBannerCode"
          />
          &nbsp; to establish connection. There's a graph waiting for you.
        </NotAuthedBanner>
      )}
      {props.connectionState === PENDING_STATE && !past10Sec && (
        <WarningBanner data-testid="reconnectBanner">
          Connection to server lost. Reconnecting...
        </WarningBanner>
      )}
      {props.connectionState === CONNECTING_STATE && past5Sec && !past10Sec && (
        <NotAuthedBanner>Still connecting...</NotAuthedBanner>
      )}
      {past10Sec && (
        <WarningBanner>
          Server is taking a long time to respond...
        </WarningBanner>
      )}
      <ErrorBoundary>
        <Stream />
      </ErrorBoundary>
    </StyledMain>
  )
})

export default Main

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
import React, { useEffect } from 'react'

import Editor from '../Editor/MainEditor'
import Stream from '../Stream/Stream'
import AutoExecButton from '../Stream/auto-exec-button'
import { useSlowConnectionState } from './main.hooks'
import {
  DismissConsentBanner,
  ErrorBanner,
  NotAuthedBanner,
  StyledMain,
  UdcConsentBanner,
  UnderlineClickable,
  WarningBanner
} from './styled'
import ErrorBoundary from 'browser-components/ErrorBoundary'
import {
  CONNECTING_STATE,
  DISCONNECTED_STATE,
  PENDING_STATE
} from 'shared/modules/connections/connectionsDuck'

type MainProps = {
  connectionState: number
  isDatabaseUnavailable: boolean
  errorMessage?: string
  lastConnectionUpdate: number
  showUdcConsentBanner: boolean
  useDb: string | null
  dismissConsentBanner: () => void
  incrementConsentBannerShownCount: () => void
  openSettingsDrawer: () => void
}

const Main = React.memo(function Main(props: MainProps) {
  const [past5Sec, past10Sec] = useSlowConnectionState(props)
  const {
    connectionState,
    isDatabaseUnavailable,
    errorMessage,
    showUdcConsentBanner,
    useDb,
    dismissConsentBanner,
    incrementConsentBannerShownCount,
    openSettingsDrawer
  } = props

  useEffect(() => {
    showUdcConsentBanner && incrementConsentBannerShownCount()
  }, [showUdcConsentBanner /* missing function from dep array but including it causes loop */])

  return (
    <StyledMain data-testid="main">
      <ErrorBoundary>
        <Editor />
      </ErrorBoundary>
      {showUdcConsentBanner && (
        <UdcConsentBanner>
          <span>
            To help make Neo4j Browser better we collect information on product
            usage. Review your{' '}
            <UnderlineClickable onClick={openSettingsDrawer}>
              settings
            </UnderlineClickable>{' '}
            at any time.
          </span>
          <DismissConsentBanner onClick={dismissConsentBanner} />
        </UdcConsentBanner>
      )}
      {useDb && isDatabaseUnavailable && (
        <ErrorBanner>
          {`Database '${useDb}' is unavailable. Run `}
          <AutoExecButton cmd="sysinfo" /> for more info.
        </ErrorBanner>
      )}
      {errorMessage && (
        <ErrorBanner data-testid="errorBanner">{errorMessage}</ErrorBanner>
      )}
      {connectionState === DISCONNECTED_STATE && (
        <NotAuthedBanner data-testid="disconnectedBanner">
          Database access not available. Please use&nbsp;
          <AutoExecButton
            cmd="server connect"
            data-testid="disconnectedBannerCode"
          />
          {` to establish connection. There's a graph waiting for you.`}
        </NotAuthedBanner>
      )}
      {connectionState === PENDING_STATE && !past10Sec && (
        <WarningBanner data-testid="reconnectBanner">
          Connection to server lost. Reconnecting...
        </WarningBanner>
      )}
      {connectionState === CONNECTING_STATE && past5Sec && !past10Sec && (
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

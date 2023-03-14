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
  DismissBanner,
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
import { TrialStatus } from 'shared/modules/dbMeta/dbMetaDuck'

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
  trialStatus: TrialStatus
}

const Main = React.memo(function Main(props: MainProps) {
  const [past5Sec, past10Sec] = useSlowConnectionState(props)
  const [showRemainingTrialBanner, setShowRemainingTrialBanner] =
    React.useState(true)
  const {
    connectionState,
    isDatabaseUnavailable,
    errorMessage,
    showUdcConsentBanner,
    useDb,
    dismissConsentBanner,
    incrementConsentBannerShownCount,
    openSettingsDrawer,
    trialStatus
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
          <DismissBanner onClick={dismissConsentBanner} />
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

      {trialStatus.status === 'expired' && (
        <ErrorBanner style={{ overflow: 'auto' }}>
          Thank you for installing Neo4j. This is a time limited trial, and the{' '}
          {trialStatus.totalDays} days have expired. Please contact us at{' '}
          <a href="https://neo4j.com/contact-us/">
            https://neo4j.com/contact-us/
          </a>{' '}
          to continue using the software. Use of this Software without a proper
          commercial or evaluation license with Neo4j, Inc. or its affiliates is
          prohibited.
        </ErrorBanner>
      )}
      {trialStatus.status === 'eval' && showRemainingTrialBanner && (
        <WarningBanner style={{ overflow: 'auto' }}>
          Thank you for installing Neo4j. This is a time limited trial. You have{' '}
          {trialStatus.daysRemaining} days remaining out of{' '}
          {trialStatus.totalDays} days. Please contact us at{' '}
          <a href="https://neo4j.com/contact-us/">
            https://neo4j.com/contact-us/
          </a>{' '}
          if you require more time.
          <div
            style={{
              position: 'absolute',
              right: 20,
              display: 'inline-block'
            }}
          >
            <DismissBanner onClick={() => setShowRemainingTrialBanner(false)} />
          </div>
        </WarningBanner>
      )}

      {trialStatus.status === 'unaccepted' && showRemainingTrialBanner && (
        <WarningBanner style={{ overflow: 'auto' }}>
          A Neo4j license has not been accepted. To accept the commercial
          license agreement, run neo4j-admin server license --accept-commercial.
          To accept the terms of the evaluation agreement, run neo4j-admin
          server license --accept-evaluation. (c) Neo4j Sweden AB. All Rights
          Reserved. Use of this Software without a proper commercial license, or
          evaluation license with Neo4j, Inc. or its affiliates is prohibited.
          Neo4j has the right to terminate your usage if you are not compliant.
          Please contact us about licensing via{' '}
          <a href="https://neo4j.com/contact-us/">
            https://neo4j.com/contact-us/
          </a>
          .
          <div
            style={{
              position: 'absolute',
              right: 20,
              display: 'inline-block'
            }}
          >
            <DismissBanner onClick={() => setShowRemainingTrialBanner(false)} />
          </div>
        </WarningBanner>
      )}

      <ErrorBoundary>
        <Stream />
      </ErrorBoundary>
    </StyledMain>
  )
})

export default Main

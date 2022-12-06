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
import { render } from '@testing-library/react'
import React from 'react'
import configureMockStore from 'redux-mock-store'
import { TrialStatus } from 'shared/modules/dbMeta/dbMetaDuck'

import Main from './Main'

const mockStore = configureMockStore()
const store = mockStore({})

const defaultTrialStatus: TrialStatus = {
  commerialLicenseAccepted: null,
  expired: null,
  daysRemaing: null
}

jest.mock(
  '../Editor/MainEditor',
  () =>
    function EmptyDiv() {
      return <div />
    }
)
jest.mock(
  '../Stream/Stream',
  () =>
    function EmptyDiv() {
      return <div />
    }
)
jest.mock(
  '../Stream/auto-exec-button',
  () =>
    function EmptyDiv() {
      return <div />
    }
)
const useDb = 'some database'
const noOp = () => undefined
const mainBaseProps = {
  useDb,
  store,
  connectionState: 2,
  lastConnectionUpdate: 0,
  showUdcConsentBanner: false,
  dismissConsentBanner: noOp,
  incrementConsentBannerShownCount: noOp,
  openSettingsDrawer: noOp
}

describe('<Main />', () => {
  it('should display an ErrorBanner when useDb is unavailable', () => {
    const { queryByText } = render(
      <Main
        {...mainBaseProps}
        isDatabaseUnavailable={true}
        trialStatus={defaultTrialStatus}
      />
    )

    expect(
      queryByText(`Database '${useDb}' is unavailable.`, { exact: false })
    ).toBeTruthy()
  })

  it('should not show Errorbanner before we have a useDb', () => {
    const { queryByText } = render(
      <Main
        {...mainBaseProps}
        useDb={null}
        isDatabaseUnavailable={true}
        trialStatus={defaultTrialStatus}
      />
    )

    expect(
      queryByText(`Database '${useDb}' is unavailable.`, { exact: false })
    ).toBeFalsy()
  })

  it('should not show Errorbanner if trial expired', () => {
    const { queryByText } = render(
      <Main
        {...mainBaseProps}
        useDb={null}
        isDatabaseUnavailable={true}
        trialStatus={{ ...defaultTrialStatus, expired: true }}
      />
    )

    expect(
      queryByText(
        `Thank you for installing Neo4j. This is a time limited trial, and the
      30 days has expired. Please contact sales@neo4j.com or
      licensing@neo4j.com to continue using the software. Use of this
      Software without a proper commercial or evaluation license with
      Neo4j,Inc. or its affiliates is prohibited`,
        { exact: false }
      )
    ).toBeFalsy()
  })

  it('should not show WarningBanner if trial active', () => {
    const { queryByText } = render(
      <Main
        {...mainBaseProps}
        useDb={null}
        isDatabaseUnavailable={true}
        trialStatus={{ ...defaultTrialStatus, daysRemaing: 19 }}
      />
    )

    expect(
      queryByText(
        `Thank you for installing Neo4j. This is a time limited trial, you
        have 19 days remaining out of 30 days. Please
        contact sales@neo4j.com if you require more time.`,
        { exact: false }
      )
    ).toBeFalsy()
  })
})

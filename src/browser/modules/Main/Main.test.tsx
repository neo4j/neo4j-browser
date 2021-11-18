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

import Main from './Main'

const mockStore = configureMockStore()
const store = mockStore({})

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
      <Main {...mainBaseProps} databaseIsUnavailable={true} />
    )

    expect(
      queryByText(`Database '${useDb}' is unavailable.`, { exact: false })
    ).toBeTruthy()
  })

  it('should not show Errorbanner before we have a useDb', () => {
    const { queryByText } = render(
      <Main {...mainBaseProps} useDb={null} databaseIsUnavailable={true} />
    )

    expect(
      queryByText(`Database '${useDb}' is unavailable.`, { exact: false })
    ).toBeFalsy()
  })
})

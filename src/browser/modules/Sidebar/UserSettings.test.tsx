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

import { UserSettings } from './UserSettings'

test('Settings renders with strange characters in display name', () => {
  // Given
  const settings = { testSetting: true }
  const visualSettings = [
    {
      title: 'Test åäö settings',
      settings: [
        {
          testSetting: {
            displayName: 'åäö üüü'
          }
        }
      ]
    }
  ]

  // When
  const { container } = render(
    <UserSettings
      settings={settings}
      visualSettings={visualSettings}
      telemetrySettings={{
        allowUserStats: false,
        allowCrashReporting: false,
        source: 'BROWSER_SETTING'
      }}
    />
  )

  // Then
  expect(container).toMatchSnapshot()
})

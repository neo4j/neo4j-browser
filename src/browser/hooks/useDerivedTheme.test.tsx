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
import { act, render } from '@testing-library/react'
import React from 'react'

import useDerivedTheme from './useDerivedTheme'
import {
  AUTO_THEME,
  DARK_THEME,
  LIGHT_THEME,
  OUTLINE_THEME
} from 'shared/modules/settings/settingsDuck'

describe('useDerivedTheme', () => {
  it('uses light as default theme if no default is passed in', () => {
    let resolvedTheme

    const Comp = () => {
      const [theme] = useDerivedTheme(undefined)
      resolvedTheme = theme
      return null
    }

    // When
    render(<Comp />)

    // Then
    expect(resolvedTheme).toEqual(LIGHT_THEME) // Default
  })
  it('uses default theme if no can be detected + it can be overridden when user has AUTO theme selected', () => {
    let resolvedTheme
    let overrideThemeFn: any

    const Comp = ({ selectedTheme, defaultTheme }: any) => {
      const [derivedTheme, setEnvTheme] = useDerivedTheme(
        selectedTheme,
        defaultTheme
      )
      resolvedTheme = derivedTheme
      overrideThemeFn = setEnvTheme
      return null
    }

    // When
    const { rerender } = render(
      <Comp defaultTheme={LIGHT_THEME} selectedTheme={AUTO_THEME} />
    )

    // Then
    expect(resolvedTheme).toEqual(LIGHT_THEME) // Default

    // When
    act(() => overrideThemeFn(OUTLINE_THEME)) // Override

    // Then
    expect(resolvedTheme).toEqual(OUTLINE_THEME)

    // When user switches off AUTO theme and selects dark
    rerender(<Comp defaultTheme={LIGHT_THEME} selectedTheme={DARK_THEME} />)

    // Then
    expect(resolvedTheme).toEqual(DARK_THEME)

    // When switching back and resetting env theme
    rerender(<Comp defaultTheme={LIGHT_THEME} selectedTheme={AUTO_THEME} />)
    act(() => overrideThemeFn(null)) // Override

    // Then
    expect(resolvedTheme).toEqual(LIGHT_THEME)
  })
})

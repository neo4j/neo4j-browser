import { act, render } from '@testing-library/react'
import React from 'react'

import { createMediaListenerMatch } from './testUtils'
import useAutoTheme from './useAutoTheme'
import { colorSchemes } from './useDetectColorScheme'

describe('useAutoTheme', () => {
  it('uses light as default theme if no default is passed in', () => {
    ;(window as any).matchMedia = undefined
    let resolvedTheme
    const lightTheme = 'light'

    const Comp = () => {
      const [autoTheme] = useAutoTheme()
      resolvedTheme = autoTheme
      return null
    }

    // When
    render(<Comp />)

    // Then
    expect(resolvedTheme).toEqual(lightTheme) // Default
  })
  it('uses default theme if no can be detected + it can be overridden', () => {
    let resolvedTheme
    let overrideThemeFn: any
    const lightTheme = 'light'
    const outlineTheme = 'outline'
    ;(window as any).matchMedia = undefined

    const Comp = ({ defaultTheme }: any) => {
      const [autoTheme, setOverrideTheme] = useAutoTheme(defaultTheme)
      resolvedTheme = autoTheme
      overrideThemeFn = setOverrideTheme
      return null
    }

    // When
    render(<Comp defaultTheme={lightTheme} />)

    // Then
    expect(resolvedTheme).toEqual(lightTheme) // Default

    // When
    act(() => overrideThemeFn(outlineTheme)) // Override

    // Then
    expect(resolvedTheme).toEqual(outlineTheme)

    // When
    act(() => overrideThemeFn(null)) // Override

    // Then
    expect(resolvedTheme).toEqual(lightTheme)
  })
  it('detects theme and allows theme to be overridden', () => {
    // Given
    let resolvedTheme
    let overrideThemeFn: any
    let listenerFn: any
    const lightTheme = 'light'
    const darkTheme = 'dark'
    const outlineTheme = 'outline'
    ;(window as any).matchMedia = jest.fn(() => {
      return {
        addListener: (listener: any) => {
          listenerFn = listener
        },
        removeListener: () => {}
      }
    })
    const Comp = ({ defaultTheme }: any) => {
      const [autoTheme, setOverrideTheme] = useAutoTheme(defaultTheme)
      resolvedTheme = autoTheme
      overrideThemeFn = setOverrideTheme
      return null
    }

    // When
    render(<Comp defaultTheme={lightTheme} />)
    act(() => listenerFn(createMediaListenerMatch(colorSchemes.DARK))) // Simulate media match event

    // Then
    expect(resolvedTheme).toEqual(darkTheme) // Auto-detected

    // When
    act(() => overrideThemeFn(outlineTheme)) // Override

    // Then
    expect(resolvedTheme).toEqual(outlineTheme)

    // When
    act(() => overrideThemeFn(null)) // no more override

    // Then
    expect(resolvedTheme).toEqual(darkTheme)

    // When
    act(() => listenerFn(createMediaListenerMatch(colorSchemes.LIGHT))) // Simulate user OS theme switch

    // Then
    expect(resolvedTheme).toEqual(lightTheme)
  })
})

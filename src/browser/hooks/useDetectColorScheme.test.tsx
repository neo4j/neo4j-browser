import { act, render } from '@testing-library/react'
import React from 'react'

import { createMediaListenerMatch } from './testUtils'
import useDetectColorScheme, { colorSchemes } from './useDetectColorScheme'

describe('useDetectColorScheme', () => {
  it('returns null if no window.matchMedia support', () => {
    ;(window as any).matchMedia = undefined

    let scheme
    const Comp = () => {
      scheme = useDetectColorScheme()
      return null
    }

    render(
      <>
        <Comp />
      </>
    )

    expect(scheme).toBe(null)
  })
  it('returns null if no theme found', () => {
    let listenerFn: any
    ;(window as any).matchMedia = jest.fn(() => {
      return {
        addListener: (listener: any) => {
          listenerFn = listener
        },
        removeListener: () => {}
      }
    })

    let scheme
    const Comp = () => {
      scheme = useDetectColorScheme()
      return null
    }

    render(
      <>
        <Comp />
      </>
    )

    act(() => listenerFn({ matches: false }))

    expect(scheme).toBe(null)
  })
  it('returns "dark" if dark theme found', () => {
    // Given
    let listenerFn: any
    const darkTheme = 'dark'
    ;(window as any).matchMedia = jest.fn(() => {
      return {
        addListener: (listener: any) => {
          listenerFn = listener
        },
        removeListener: () => {}
      }
    })
    let scheme
    const Comp = () => {
      scheme = useDetectColorScheme()
      return null
    }

    // When
    render(
      <>
        <Comp />
      </>
    )
    act(() => listenerFn(createMediaListenerMatch(colorSchemes.DARK))) // Simulate media match event

    // Then
    expect(scheme).toEqual(darkTheme)
  })
  it('stays at null if unknown theme found', () => {
    // Given
    let listenerFn: any
    const nonExistingTheme = 'non-existing-theme'
    ;(window as any).matchMedia = jest.fn(() => {
      return {
        addListener: (listener: any) => {
          listenerFn = listener
        },
        removeListener: () => {}
      }
    })
    let scheme
    const Comp = () => {
      scheme = useDetectColorScheme()
      return null
    }

    // When
    render(
      <>
        <Comp />
      </>
    )
    act(() => listenerFn(createMediaListenerMatch(nonExistingTheme))) // Simulate media match event

    // Then
    expect(scheme).toEqual(null)
  })
})

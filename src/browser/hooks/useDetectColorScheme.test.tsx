import React from 'react'
import { render, act } from '@testing-library/react'
import useDetectColorScheme, { colorSchemes } from './useDetectColorScheme'
import { createMediaListenerMatch } from './testUtils'

describe('useDetectColorScheme', () => {
  it('returns null if no window.matchMedia support', () => {
    window.matchMedia = undefined

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
    let listenerFn
    window.matchMedia = jest.fn(() => {
      return {
        addListener: listener => {
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
    let listenerFn
    const darkTheme = 'dark'
    window.matchMedia = jest.fn(() => {
      return {
        addListener: listener => {
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
    let listenerFn
    const nonExistingTheme = 'non-existing-theme'
    window.matchMedia = jest.fn(() => {
      return {
        addListener: listener => {
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

import React from 'react'

import { cleanGuidesFromStorage, initialState } from './guidesDuck'

describe('loads from localstorage', () => {
  it('handles missing stored data', () => {
    expect(cleanGuidesFromStorage(undefined)).toEqual(initialState)
  })
  it('handles incorrect stored data types', () => {
    expect(cleanGuidesFromStorage([] as any)).toEqual(initialState)
    expect(cleanGuidesFromStorage('string' as any)).toEqual(initialState)
  })
  it('handles if jsx is stored by mistake', () => {
    expect(
      cleanGuidesFromStorage({
        currentGuide: {
          currentSlide: 3,
          title: 'a guide',
          identifier: 'guide2',
          slides: [<div key="key"> whoops</div>]
        },
        remoteGuides: []
      })
    ).toEqual(initialState)
  })
  it('handles proper stored data', () => {
    const guide = {
      currentSlide: 234,
      title: 'what a great guide',
      identifier: 'great guide 2 '
    }

    expect(cleanGuidesFromStorage(initialState)).toEqual(initialState)
    expect(
      cleanGuidesFromStorage({ ...initialState, remoteGuides: [guide] })
    ).toEqual({ ...initialState, remoteGuides: [guide] })
  })
  it('handle a real life store', () => {
    const test = {
      currentGuide: null,
      remoteGuides: [
        { currentSlide: 0, title: 'Movie Graph Guide', identifier: 'movies' },
        {
          currentSlide: 0,
          title: 'query-template',
          identifier: 'query-template'
        },
        {
          currentSlide: 0,
          title: 'Northwind Graph Guide',
          identifier: 'northwind'
        }
      ]
    }
    expect(cleanGuidesFromStorage(test)).toEqual(test)
  })
})

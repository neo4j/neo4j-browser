import { cleanSyncConsentFromStorage, initialConsentState } from './syncDuck'

describe('loads from localstorage', () => {
  it('handles missing stored data', () => {
    expect(cleanSyncConsentFromStorage(undefined)).toEqual(initialConsentState)
  })
  it('handles incorrect stored data types', () => {
    expect(cleanSyncConsentFromStorage([] as any)).toEqual(initialConsentState)
    expect(cleanSyncConsentFromStorage('string' as any)).toEqual(
      initialConsentState
    )
  })
  it('handles wrongly stored data', () => {
    expect(
      cleanSyncConsentFromStorage({ consented: 243, optedOut: 'b' } as any)
    ).toEqual(initialConsentState)
    expect(
      cleanSyncConsentFromStorage({ consented: true, optedOut: 'b' } as any)
    ).toEqual({ consented: true, optedOut: false })
  })

  it('handles proper stored data', () => {
    const state = { consented: false, optedOut: true }

    expect(cleanSyncConsentFromStorage(state)).toEqual(state)
  })
  it('handle a real life store', () => {
    const test = { consented: true, optedOut: false }
    expect(cleanSyncConsentFromStorage(test)).toEqual(test)
  })
})

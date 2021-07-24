import {
  addSearchParamsInBrowserHistory,
  removeSearchParamsInBrowserHistory
} from './helpers'

describe('addSearchParamsInBrowserHistory', () => {
  const originalWindowLocationHref = 'http://localhost/'

  afterEach(() => {
    window.history.replaceState({}, '', originalWindowLocationHref)
  })

  test('no args passed in', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    addSearchParamsInBrowserHistory()
    expect(window.location.href).toEqual(originalWindowLocationHref)
  })

  test('empty passed in args', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    addSearchParamsInBrowserHistory({})
    expect(window.location.href).toEqual(originalWindowLocationHref + '?')
  })

  test('simple search parameter', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    addSearchParamsInBrowserHistory({ rest: 'test' })
    expect(window.location.href).toEqual(
      originalWindowLocationHref + '?rest=test'
    )
  })

  test('search parameter with special characters', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    addSearchParamsInBrowserHistory({ test_entry: '5%73bsod?892()€%&#"€' })
    expect(window.location.href).toEqual(
      originalWindowLocationHref +
        '?test_entry=5%2573bsod%3F892%28%29%E2%82%AC%25%26%23%22%E2%82%AC'
    )
  })

  test('multiple search parameters', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    addSearchParamsInBrowserHistory({
      test_entry: '5%73bsod?892()€%&#"€',
      entryUrl: 'http://localhost:8043/test/?entry=boat'
    })
    expect(window.location.href).toEqual(
      originalWindowLocationHref +
        '?test_entry=5%2573bsod%3F892%28%29%E2%82%AC%25%26%23%22%E2%82%AC&entryUrl=http%3A%2F%2Flocalhost%3A8043%2Ftest%2F%3Fentry%3Dboat'
    )
  })

  test('keeps URL hash parameters', () => {
    const hashUrlParams = '#code=df56&code_verifier=rt43'
    window.history.replaceState(
      {},
      '',
      originalWindowLocationHref + hashUrlParams
    )
    expect(window.location.href).toEqual(
      originalWindowLocationHref + hashUrlParams
    )
    addSearchParamsInBrowserHistory({ rest: 'test' })
    expect(window.location.href).toEqual(
      originalWindowLocationHref + '?rest=test' + hashUrlParams
    )
  })
})

describe('removeSearchParamsInBrowserHistory', () => {
  const originalWindowLocationHref =
    'http://localhost/?test_param=house&code=843cvg'

  beforeEach(() => {
    window.history.replaceState({}, '', originalWindowLocationHref)
  })

  test('no args passed in', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    removeSearchParamsInBrowserHistory()
    expect(window.location.href).toEqual(originalWindowLocationHref)
  })

  test('empty passed args', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    removeSearchParamsInBrowserHistory([])
    expect(window.location.href).toEqual(originalWindowLocationHref)
  })

  test('non-existing parameter in browser history', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    removeSearchParamsInBrowserHistory(['kode'])
    expect(window.location.href).toEqual(originalWindowLocationHref)
  })

  test('remove existing parameter from browser history', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    removeSearchParamsInBrowserHistory(['test_param'])
    expect(window.location.href).toEqual('http://localhost/?code=843cvg')
  })

  test('remove all existing parameters from browser history', () => {
    expect(window.location.href).toEqual(originalWindowLocationHref)
    removeSearchParamsInBrowserHistory(['test_param', 'code'])
    expect(window.location.href).toEqual('http://localhost/?')
  })

  test('keeps URL hash parameters', () => {
    const hashUrlParams = '#box=/&%#/=Q4535&state_test=ljhf873'
    window.history.replaceState(
      {},
      '',
      originalWindowLocationHref + hashUrlParams
    )
    expect(window.location.href).toEqual(
      originalWindowLocationHref + hashUrlParams
    )
    removeSearchParamsInBrowserHistory(['test_param'])
    expect(window.location.href).toEqual(
      'http://localhost/?code=843cvg' + hashUrlParams
    )
  })
})

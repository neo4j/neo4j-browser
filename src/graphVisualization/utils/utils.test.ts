import { selectorArrayToString, selectorStringToArray } from './utils'

describe('selectors', () => {
  test('selectorStringToArray unescapes selectors with . in them', () => {
    const tests = [
      { test: 'foo', expect: ['foo'] },
      { test: 'foo.bar', expect: ['foo', 'bar'] },
      { test: 'foo.bar.baz', expect: ['foo', 'bar', 'baz'] },
      { test: 'foo\\.bar', expect: ['foo.bar'] },
      { test: 'foo\\.bar\\.baz', expect: ['foo.bar.baz'] },
      { test: 'foo\\.bar.baz\\.baz', expect: ['foo.bar', 'baz.baz'] },
      {
        test: 'node.foo\\.bar\\.baz.bax',
        expect: ['node', 'foo.bar.baz', 'bax']
      }
    ]

    tests.forEach(t => {
      expect(selectorStringToArray(t.test)).toEqual(t.expect)
    })
  })
  test('selectorArrayToString escapes selectors with . in them', () => {
    const tests = [
      { expect: 'foo', test: ['foo'] },
      { expect: 'foo.bar', test: ['foo', 'bar'] },
      { expect: 'foo.bar.baz', test: ['foo', 'bar', 'baz'] },
      { expect: 'foo\\.bar', test: ['foo.bar'] },
      { expect: 'foo\\.bar\\.baz', test: ['foo.bar.baz'] },
      { expect: 'foo\\.bar.baz\\.baz', test: ['foo.bar', 'baz.baz'] },
      {
        expect: 'node.foo\\.bar\\.baz.bax',
        test: ['node', 'foo.bar.baz', 'bax']
      }
    ]

    tests.forEach(t => {
      expect(selectorArrayToString(t.test)).toEqual(t.expect)
    })
  })
})

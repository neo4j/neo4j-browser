/* global test, expect */
import * as utils from './remoteUtils'

describe('commandutils', () => {
  test('removes script tags', () => {
    const text = 'hello<script>alert(1)</script> <p onclick="alert(1)">test</p>'
    expect(utils.cleanHtml(text)).toEqual('hello <p>test</p>')
  })
})

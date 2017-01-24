import { expect } from 'chai'
import * as utils from './remoteUtils'

describe('commandutils', () => {
  it('removes script tags', () => {
    const text = 'hello<script>alert(1)</script> <p onclick="alert(1)">test</p>'
    expect(utils.cleanHtml(text)).to.equal('hello <p>test</p>')
  })
})

import { expect } from 'chai'
import * as utils from '../../src/services/commandUtils'

describe('commandutils', () => {
  it('stripCommandComments should remove lines starting with a comment ', () => {
    const testStrs = [
      '//This is a comment\nRETURN 1',
      '// Another comment\nRETURN 1',
      '// Another comment\nRETURN 1\n//Next comment'
    ]
    testStrs.forEach((str) => {
      expect(utils.stripCommandComments(str)).to.equal('RETURN 1')
    })
  })

  it('stripEmptyCommandLines should remove empty lines ', () => {
    const testStrs = [
      '\n\n     \nRETURN 1',
      '   \n\nRETURN 1\n  \n\n',
      'RETURN \n\n 1\n'
    ]
    testStrs.forEach((str) => {
      expect(utils.stripEmptyCommandLines(str)).to.equal('RETURN 1')
    })
  })
})

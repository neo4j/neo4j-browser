import { expect } from 'chai'
import * as utils from './commandUtils'

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

  it('splitStringOnFirst should split strings on first occurance of delimiter ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', delimiter: ' ', expect: [':config', 'test:"hello :space"']},
      {str: 'test:"hello :space"', delimiter: ':', expect: ['test', '"hello :space"']}
    ]
    testStrs.forEach((obj) => {
      expect(utils.splitStringOnFirst(obj.str, obj.delimiter)).to.deep.equal(obj.expect)
    })
  })

  it('parseConfigInput should create an object from string input ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', expect: {test: 'hello :space'}},
      {str: ':config test:10', expect: {test: 10}},
      {str: ':config test:null', expect: {test: null}},
      {str: ':config test:""', expect: {test: ''}},
      {str: ':config test: 10', expect: {test: 10}}, // space before value
      {str: ':config test', expect: false} // Not valid
    ]
    testStrs.forEach((obj) => {
      expect(utils.parseConfigInput(obj.str)).to.deep.equal(obj.expect)
    })
  })
})

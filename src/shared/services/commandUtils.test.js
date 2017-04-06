/* global describe, test, expect */
import * as utils from './commandUtils'

describe('commandutils', () => {
  test('stripCommandComments should remove lines starting with a comment ', () => {
    const testStrs = [
      '//This is a comment\nRETURN 1',
      '// Another comment\nRETURN 1',
      '// Another comment\nRETURN 1\n//Next comment'
    ]
    testStrs.forEach((str) => {
      expect(utils.stripCommandComments(str)).toEqual('RETURN 1')
    })
  })

  test('stripEmptyCommandLines should remove empty lines ', () => {
    const testStrs = [
      '\n\n     \nRETURN 1',
      '   \n\nRETURN 1\n  \n\n',
      'RETURN \n\n 1\n'
    ]
    testStrs.forEach((str) => {
      expect(utils.stripEmptyCommandLines(str)).toEqual('RETURN 1')
    })
  })

  test('splitStringOnFirst should split strings on first occurance of delimiter ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', delimiter: ' ', expect: [':config', 'test:"hello :space"']},
      {str: 'test:"hello :space"', delimiter: ':', expect: ['test', '"hello :space"']}
    ]
    testStrs.forEach((obj) => {
      expect(utils.splitStringOnFirst(obj.str, obj.delimiter)).toEqual(obj.expect)
    })
  })

  test('splitStringOnLast should split strings on last occurance of delimiter ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', delimiter: ' ', expect: [':config test:"hello', ':space"']},
      {str: 'test:"hello :space"', delimiter: ':', expect: ['test:"hello ', 'space"']}
    ]
    testStrs.forEach((obj) => {
      expect(utils.splitStringOnLast(obj.str, obj.delimiter)).toEqual(obj.expect)
    })
  })

  test('extractCommandParameters should create an object from string input ', () => {
    const testStrs = [
      {str: ':config test:"hello :space"', expect: {test: 'hello :space'}},
      {str: ':config test:10', expect: {test: 10}},
      {str: ':config my test:10', expect: {'my test': 10}},
      {str: ':config `my:test`: 10', expect: {'my:test': 10}},
      {str: ':config test:null', expect: {test: null}},
      {str: ':config test:""', expect: {test: ''}},
      {str: ':config test: 10', expect: {test: 10}}, // space before value
      {str: ':config test:`hello " there`', expect: {test: 'hello " there'}},
      {str: ':config test:{x: "h"}', expect: {test: {x: 'h'}}},
      {str: ':config test:[1, 2, false, [3, 4, true]]', expect: {test: [1, 2, false, [3, 4, true]]}},
      {str: ':config {test: 10}', expect: false}, // Cannot parse object directly
      {str: ':config test', expect: false} // Not valid
    ]
    testStrs.forEach((obj) => {
      expect(utils.extractCommandParameters(':config', obj.str)).toEqual(obj.expect)
    })
  })
  test('parseCommandJSON should parse input as an object ', () => {
    const testStrs = [
      {str: ':config {test: 10}', expect: {test: 10}},
      {str: ':config {test: [1, 2, false, [4, 5]]}', expect: {test: [1, 2, false, [4, 5]]}},
      {str: ':config {test: 1, b: {x: "hej"}}', expect: {test: 1, b: {x: 'hej'}}},
      {str: ':config test:1', expect: false}, // Not valid
      {str: ':config null', expect: false}, // Not valid
      {str: ':config test', expect: false} // Not valid
    ]
    testStrs.forEach((obj) => {
      expect(utils.parseCommandJSON(':config', obj.str)).toEqual(obj.expect)
    })
  })
})

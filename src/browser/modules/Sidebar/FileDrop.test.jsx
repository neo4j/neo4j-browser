/* global describe, test, expect, jest */
import React from 'react'
import { FileDrop } from './FileDrop'
import { shallow } from 'enzyme'

describe('FileDrop', () => {
  const expectedFileContent = 'some content'
  const file = new window.File([expectedFileContent], 'valid.cypher')
  const unknownFile = new window.File([expectedFileContent], 'invalid.file')
  const readAsText = jest.fn()
  const stubFileReader = { readAsText, result: expectedFileContent }

  test('should read file', (done) => {
    const onFileDropped = jest.fn()
    const wrapper = shallow(<FileDrop fileReader={stubFileReader} onFileDropped={onFileDropped} />)
    wrapper.instance().onDrop([file])

    try {
      expect(readAsText).toBeCalledWith(file)
      done()
    } catch (error) {
      done.fail(error)
    }
  })
  test('should not read file', (done) => {
    const onFileDropped = jest.fn()
    const wrapper = shallow(<FileDrop fileReader={stubFileReader} onFileDropped={onFileDropped} />)
    wrapper.instance().onDrop([unknownFile])

    try {
      expect(wrapper.state().error).toContain('.file')
      done()
    } catch (error) {
      done.fail(error)
    }
  })
})

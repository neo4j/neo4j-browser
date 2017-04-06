/* global test, expect */
import React from 'react'
import DocumentsComponent from './Documents'
import DocumentItems from './DocumentItems'
import { shallow } from 'enzyme'

describe('DocumentsComponent', () => {
  test('should show list of documents', () => {
    const documents = {intro: [], help: [], reference: [{name: 'hello', command: 'test commands'}]}
    const wrapper = shallow(<DocumentsComponent items={documents} />)
    expect(wrapper.find(DocumentItems).length).toBe(3)
  })
})

import React from 'react'
import DocumentsComponent from './Documents'
import DocumentItems from './DocumentItems'
import { expect } from 'chai'
import { shallow } from 'enzyme'

describe('DocumentsComponent', () => {
  it('should show list of documents', () => {
    const documents = {intro: [], help: [], reference: [{name: 'hello', command: 'test commands'}]}
    const wrapper = shallow(<DocumentsComponent items={documents} />)
    expect(wrapper.find(DocumentItems)).to.have.length(3)
  })
})

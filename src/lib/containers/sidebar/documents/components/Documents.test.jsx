import React from 'react'
import { DocumentsComponent } from './Documents'
import { expect } from 'chai'
import { mount } from 'enzyme'
import documents from '../../documents'

describe('DocumentsComponent', () => {
  it('should show list of documents when ', () => {
    const documents = {intro: [], help: [], reference: [{name: 'hello', command: 'test commands'}]}
    const wrapper = mount(<DocumentsComponent items={documents}/>)
    expect(wrapper.find('.document')).to.have.length(3)
  })
  it('should not show list of documents', () => {
    const documents = {intro: [], help: [], reference: [{name: 'hello', command: 'test commands'}]}
    const wrapper = mount(<DocumentsComponent items={documents}/>)
    expect(wrapper.find('.document')).to.have.length(3)
  })
})

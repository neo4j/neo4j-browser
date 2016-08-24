import React from 'react'
import { mount } from 'enzyme'
import {StyleEditorComponent} from './StyleEditor'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import fileImporter from '../../fileImporter'

describe('StyleFrame', () => {
  const expect = chai.expect
  chai.use(spies)
  chai.use(chaiEnzyme())
  it('should call reset function property when reset button is clicked ', () => {
    const resetFunction = chai.spy()
    const wrapper = mount(<MuiThemeProvider><StyleEditorComponent reset={resetFunction}/></MuiThemeProvider>)
    expect(wrapper.find('.reset-button')).to.have.length(1)
    wrapper.find('.reset-button').simulate('click')
    expect(resetFunction).to.have.been.called()
  })
  it('should export grass style to file when export button is clicked', () => {
    const saveAsFunction = chai.spy()
    const wrapper = mount(<MuiThemeProvider><StyleEditorComponent graphStyleData={'hello'} saveAsFunction={saveAsFunction} /></MuiThemeProvider>)
    expect(wrapper.find('.export-button')).to.have.length(1)
    wrapper.find('.export-button').props().onClick('hello', saveAsFunction)
    expect(saveAsFunction).to.have.been.called.with(new Blob(['hello'], { type: 'text/plain;charset=utf-8' }))
  })
  it('should pass an importSuccess function to FileDropBar', () => {
    const updateFunction = chai.spy()
    const wrapper = mount(<MuiThemeProvider><StyleEditorComponent update={updateFunction}/></MuiThemeProvider>)
    expect(wrapper.find(fileImporter.components.FileDropBar)).to.have.length(1)
    wrapper.find(fileImporter.components.FileDropBar).props().onImportSuccess('hello')
    expect(updateFunction).to.have.been.called.with('hello')
  })
})

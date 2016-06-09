import { EditorComponent } from './Editor'
import { mount } from 'enzyme'
import React from 'react'
import Codemirror from 'react-codemirror'
import chai from 'chai'
import chaiEnzyme from 'chai-enzyme'
import spies from 'chai-spies'

describe('Editor', () => {
  const expect = chai.expect
  chai.use(spies)
  chai.use(chaiEnzyme())
  const onExecute = chai.spy()
  it('should render Codemirror component with correct properties', () => {
    let content = 'content-' + Math.random()
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} content={content} history='' />
    )
    const codeMirror = wrapper.find(Codemirror)
    expect(codeMirror.props().value).to.equal(content)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).have.been.called()
  })

  it('should execute current command on Cmd-Enter', () => {
    let content = 'content-' + Math.random()
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} content={content} history='' />
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).have.been.called.with(content)
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('')
  })

  it('should execute current command on Ctrl-Enter', () => {
    let content = 'content-' + Math.random()
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} content={content} history='' />
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Ctrl-Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).have.been.called.with(content)
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('')
  })

  it('should replace content as with history as user arrows up and down', () => {
    let content = 'content-' + Math.random()
    let history = [{cmd: 'latest'}, {cmd: 'middle'}, {cmd: 'oldest'}]
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} content={content} history={history}/>
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('latest')
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Ctrl-Up'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('middle')
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Ctrl-Up'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('oldest')
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Down'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('middle')
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Ctrl-Down'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('latest')
  })

  it('should resest history after execution', () => {
    let history = [{cmd: 'latest'}, {cmd: 'middle'}, {cmd: 'oldest'}]
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} content='' history={history}/>
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('middle')
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Enter'](codeMirror.get(0).getCodeMirror())
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    expect(codeMirror.get(0).getCodeMirror().getValue()).to.equal('latest')
  })

  it('should call execute on Enter if there is only 1 line in the command', () => {
    const updateContent = chai.spy()
    let content = 'content-' + Math.random()
    let history = [{cmd: 'latest'}, {cmd: 'middle'}, {cmd: 'oldest'}]
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} updateContent={updateContent} content={content} history={history}/>
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).have.been.called.with(content)
  })

  it('should not call execute on Enter if there is more than 1 line in the command', () => {
    const updateContent = chai.spy()
    let content = 'content-' + Math.random() + '\n hello'
    let history = [{cmd: 'latest'}, {cmd: 'middle'}, {cmd: 'oldest'}]
    let wrapper = mount(
      <EditorComponent onExecute={onExecute} updateContent={updateContent} content={content} history={history}/>
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror.get(0).getCodeMirrorInstance().keyMap['default']['Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).not.have.been.called
  })
})

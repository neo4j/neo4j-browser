/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global describe, test, beforeEach, expect, jest */
import { Editor as EditorComponent } from './Editor'
import { createBus } from 'suber'
import { mount } from 'enzyme'
import React from 'react'
import Codemirror from 'react-codemirror'

describe('Editor', () => {
  let onExecute

  beforeEach(() => {
    onExecute = jest.fn()
  })

  test.skip('should render Codemirror component with correct properties', () => {
    const content = 'content-' + Math.random()
    const wrapper = mount(
      <EditorComponent
        bus={createBus()}
        onExecute={onExecute}
        content={content}
        history=''
      />
    )
    const codeMirror = wrapper.find(Codemirror)
    expect(codeMirror.props().value).toEqual(content)
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).toHaveBeenCalled()
  })

  test.skip('should execute current command on Cmd-Enter', () => {
    const content = 'content-' + Math.random()
    const wrapper = mount(
      <EditorComponent
        bus={createBus()}
        onExecute={onExecute}
        content={content}
        history=''
      />
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).toHaveBeenCalledWith(content)
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('')
  })

  test.skip('should execute current command on Ctrl-Enter', () => {
    const content = 'content-' + Math.random()
    const wrapper = mount(
      <EditorComponent
        bus={createBus()}
        onExecute={onExecute}
        content={content}
        history=''
      />
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Ctrl-Enter'](codeMirror.get(0).getCodeMirror())
    expect(onExecute).toHaveBeenCalledWith(content)
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('')
  })

  test.skip('should replace content as with history as user arrows up and down', () => {
    const content = 'content-' + Math.random()
    const history = [{ cmd: 'latest' }, { cmd: 'middle' }, { cmd: 'oldest' }]
    const wrapper = mount(
      <EditorComponent
        bus={createBus()}
        onExecute={onExecute}
        content={content}
        history={history}
      />
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('latest')
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Ctrl-Up'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('middle')
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Ctrl-Up'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('oldest')
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Down'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('middle')
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Ctrl-Down'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('latest')
  })

  test.skip('should resest history after execution', () => {
    const history = [{ cmd: 'latest' }, { cmd: 'middle' }, { cmd: 'oldest' }]
    const wrapper = mount(
      <EditorComponent
        bus={createBus()}
        onExecute={onExecute}
        content=''
        history={history}
      />
    )
    const codeMirror = wrapper.find(Codemirror)
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('middle')
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Enter'](codeMirror.get(0).getCodeMirror())
    codeMirror
      .get(0)
      .getCodeMirrorInstance()
      .keyMap['default']['Cmd-Up'](codeMirror.get(0).getCodeMirror())
    expect(
      codeMirror
        .get(0)
        .getCodeMirror()
        .getValue()
    ).toEqual('latest')
  })
})

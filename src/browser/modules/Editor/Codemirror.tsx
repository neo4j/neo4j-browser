/*
 * Copyright (c) 2002-2021 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

import React, { Component } from 'react'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/edit/closebrackets'
import { createCypherEditor, parse } from 'cypher-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.css'
import 'cypher-codemirror/dist/cypher-codemirror-syntax.css'
import { debounce } from 'services/utils'

type State = any

export default class CodeMirror extends Component<any, State> {
  codeMirror: any
  debouncedOnParse: any
  editorReference: any
  editorSupport: any
  lastChange = null
  constructor(props: any) {
    super(props)
    this.state = {
      isFocused: false
    }
  }

  componentDidMount() {
    this.debouncedOnParse = debounce(this.onParsed, 300, this)
    const textareaNode = this.editorReference
    const { editor, editorSupport } = createCypherEditor(
      textareaNode,
      this.props.options
    )
    this.codeMirror = editor
    this.codeMirror.on('change', this.codemirrorValueChange) // Triggered before DOM update
    this.codeMirror.on('changes', this.codemirrorValueChanges) // Triggered after DOM update
    this.codeMirror.on('focus', this.focusChanged.bind(this, true))
    this.codeMirror.on('blur', this.focusChanged.bind(this, false))
    this.codeMirror.on('scroll', this.scrollChanged.bind(this))
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || '')
    this.editorSupport = editorSupport
    this.editorSupport.setSchema(this.props.schema)

    if (this.props.initialPosition) {
      this.goToPosition(this.props.initialPosition)
    }
  }

  goToPosition(position: any) {
    for (let i = 0; i < position.line; i++) {
      this.codeMirror.execCommand('goLineDown')
    }

    for (let i = 0; i <= position.column; i++) {
      this.codeMirror.execCommand('goCharRight')
    }
  }

  componentDidUpdate(prevProps: any) {
    if (typeof this.props.options === 'object') {
      for (const optionName in this.props.options) {
        if (this.props.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, this.props.options[optionName])
        }
      }
    }
    if (this.props.schema) {
      this.editorSupport.setSchema(prevProps.schema)
    }
  }

  getCodeMirror() {
    return this.codeMirror
  }

  generateStatementsFromCurrentValue() {
    const parsed = parse(this.codeMirror.getValue())
    const { queriesAndCommands } = parsed.referencesListener
    return queriesAndCommands
  }

  focus() {
    if (this.codeMirror) {
      this.codeMirror.focus()
    }
  }

  focusChanged(focused: any) {
    this.setState({
      isFocused: focused
    })
    this.props.onFocusChange && this.props.onFocusChange(focused)
  }

  scrollChanged(cm: any) {
    this.props.onScroll && this.props.onScroll(cm.getScrollInfo())
  }

  codemirrorValueChange = (doc: any, change: any) => {
    this.lastChange = change
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change)
    }
    this.debouncedOnParse()
  }

  codemirrorValueChanges = (doc: any, changes: any) => {
    if (
      this.props.onChanges &&
      changes.some((change: any) => change.origin !== 'setValue')
    ) {
      this.props.onChanges(doc.getValue(), changes)
    }
  }

  onParsed = () => {
    this.props.onParsed &&
      this.props.onParsed(
        this.generateStatementsFromCurrentValue(),
        this.lastChange
      )
  }

  render() {
    const editorClassNames = [
      'ReactCodeMirror',
      this.state.isFocused ? 'ReactCodeMirror--focused' : '',
      this.props.classNames
    ].join(' ')

    const setEditorReference = (ref: any) => {
      this.editorReference = ref
    }
    return (
      <div
        className={editorClassNames}
        ref={setEditorReference}
        data-testid="editor-wrapper"
      />
    )
  }
}

/*
 * Copyright (c) 2002-2017 "Neo Technology,"
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

import { Component } from 'preact'
import classNames from 'classnames'
import debounce from 'lodash.debounce'
import codemirror from 'codemirror'

function normalizeLineEndings (str) {
  if (!str) return str
  return str.replace(/\r\n|\r/g, '\n')
}

export default class CodeMirror extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isFocused: false
    }
  }
  getCodeMirrorInstance () {
    return codemirror
  }
  componentWillMount () {
    this.componentWillReceiveProps = debounce(this.componentWillReceiveProps, 0)
  }
  componentDidMount () {
    const textareaNode = this.ta
    const codeMirrorInstance = this.getCodeMirrorInstance()
    this.codeMirror = codeMirrorInstance.fromTextArea(textareaNode, this.props.options)
    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
    this.codeMirror.on('focus', this.focusChanged.bind(this, true))
    this.codeMirror.on('blur', this.focusChanged.bind(this, false))
    this.codeMirror.on('scroll', this.scrollChanged.bind(this))
    this.codeMirror.setValue(this.props.defaultValue || this.props.value || '')

    if (this.props.initialPosition) {
      this.goToPosition(codeMirrorInstance, this.props.initialPosition)
    }
  }
  goToPosition (codeMirrorInstance, position) {
    for (let i = 0; i < position.line; i++) {
      codeMirrorInstance.commands.goLineDown(this.codeMirror)
    }

    for (let i = 0; i <= position.column; i++) {
      codeMirrorInstance.commands.goCharRight(this.codeMirror)
    }
  }
  componentWillUnmount () {
    // is there a lighter-weight way to remove the cm instance?
    if (this.codeMirror) {
      this.codeMirror.toTextArea()
    }
  }
  componentWillReceiveProps (nextProps) {
    if (this.codeMirror && nextProps.value !== undefined && normalizeLineEndings(this.codeMirror.getValue()) !== normalizeLineEndings(nextProps.value)) {
      if (this.props.preserveScrollPosition) {
        const prevScrollPosition = this.codeMirror.getScrollInfo()
        this.codeMirror.setValue(nextProps.value)
        this.codeMirror.scrollTo(prevScrollPosition.left, prevScrollPosition.top)
      } else {
        this.codeMirror.setValue(nextProps.value)
      }
    }
    if (typeof nextProps.options === 'object') {
      for (let optionName in nextProps.options) {
        if (nextProps.options.hasOwnProperty(optionName)) {
          this.codeMirror.setOption(optionName, nextProps.options[optionName])
        }
      }
    }
  }
  getCodeMirror () {
    return this.codeMirror
  }
  focus () {
    if (this.codeMirror) {
      this.codeMirror.focus()
    }
  }
  focusChanged (focused) {
    this.setState({
      isFocused: focused
    })
    this.props.onFocusChange && this.props.onFocusChange(focused)
  }
  scrollChanged (cm) {
    this.props.onScroll && this.props.onScroll(cm.getScrollInfo())
  }
  codemirrorValueChanged (doc, change) {
    if (this.props.onChange && change.origin !== 'setValue') {
      this.props.onChange(doc.getValue(), change)
    }
  }
  render () {
    const editorClassNames = classNames(
        'ReactCodeMirror',
        this.state.isFocused ? 'ReactCodeMirror--focused' : null,
        this.props.classNames
      )
    return (
      <div classNames={editorClassNames}>
        <textarea ref={(ref) => { this.ta = ref }} name={this.props.path} defaultValue={this.props.value} autoComplete='off' />
      </div>
    )
  }
}

/*
 * Copyright (c) 2002-2020 "Neo4j,"
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
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { withTheme } from 'styled-components'
import {
  commandSources,
  executeCommand,
  executeSystemCommand
} from 'shared/modules/commands/commandsDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import {
  shouldEditorAutocomplete,
  shouldEditorLint,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { add } from 'shared/modules/stream/streamDuck'
import { deepEquals } from 'services/utils'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import Codemirror from './Codemirror'
import * as schemaConvert from './editorSchemaConverter'
import cypherFunctions from './cypher/functions'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'
import { isRelateAvailable } from 'shared/modules/app/appDuck'

type EditorState = any

export class Editor extends Component<any, EditorState> {
  codeMirror: any
  editor: any
  constructor(props: any) {
    super(props)
    this.state = {
      historyIndex: -1,
      buffer: '',
      mode: 'cypher',
      notifications: [],
      lastPosition: { line: 0, column: 0 },
      contentId: null
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: EditorState) {
    return !(
      nextState.contentId === this.state.contentId &&
      deepEquals(nextProps.schema, this.props.schema) &&
      nextProps.useDb === this.props.useDb
    )
  }

  newlineAndIndent(cm: any) {
    cm.execCommand('newlineAndIndent')
  }

  execCommand(cmd: any) {
    this.props.onExecute(cmd)
  }

  moveCursorToEndOfLine(cm: any) {
    cm.setCursor(cm.lineCount(), 0)
  }

  handleUp(cm: any) {
    if (cm.lineCount() === 1) {
      this.historyPrev(cm)
      this.moveCursorToEndOfLine(cm)
    } else {
      cm.execCommand('goLineUp')
    }
  }

  handleDown(cm: any) {
    if (cm.lineCount() === 1) {
      this.historyNext(cm)
      this.moveCursorToEndOfLine(cm)
    } else {
      cm.execCommand('goLineDown')
    }
  }

  historyPrev(cm: any) {
    if (!this.props.history.length) return
    if (this.state.historyIndex + 1 === this.props.history.length) return
    if (this.state.historyIndex === -1) {
      // Save what's currently in the editor
      this.setState({ buffer: cm.getValue() })
    }
    this.setState({
      historyIndex: this.state.historyIndex + 1
    })
    // this.setEditorValue(this.props.history[this.state.historyIndex])
  }

  historyNext(_cm: any) {
    if (!this.props.history.length) return
    if (this.state.historyIndex <= -1) return
    if (this.state.historyIndex === 0) {
      // Should read from buffer
      this.setState({ historyIndex: -1 })
      // this.setEditorValue(this.state.buffer)
      return
    }
    this.setState({
      historyIndex: this.state.historyIndex - 1
    })
    // this.setEditorValue(this.props.history[this.state.historyIndex])
  }

  triggerAutocompletion = (cm: any, changed: any) => {
    if (
      !changed ||
      !changed.text ||
      changed.text.length !== 1 ||
      !this.props.enableEditorAutocomplete
    ) {
      return
    }

    const text = changed.text[0]
    const triggerAutocompletion =
      text === '.' ||
      text === ':' ||
      text === '[]' ||
      text === '()' ||
      text === '{}' ||
      text === '[' ||
      text === '(' ||
      text === '{'
    if (triggerAutocompletion) {
      try {
        cm.execCommand('autocomplete')
      } catch (e) {}
    }
  }

  componentDidMount() {
    this.loadCodeMirror()
  }

  componentWillUnmount() {
    clearInterval(this.codeMirror.display.blinker)
  }

  loadCodeMirror = () => {
    if (this.codeMirror) {
      return
    }
    if (!this.editor) {
      setTimeout(() => this.loadCodeMirror(), 200)
      return
    }
    this.codeMirror = this.editor.getCodeMirror()
    this.codeMirror.on('change', (cm: any, changed: any) => {
      try {
        this.triggerAutocompletion(cm, changed)
      } catch (e) {
        console.log(e)
      }
    })
    if (this.props.editorRef) {
      this.props.editorRef.current = this.codeMirror
    }
  }

  getEditorValue() {
    return this.codeMirror ? this.codeMirror.getValue().trim() : ''
  }

  setContentId(id: any) {
    this.setState({ contentId: id })
  }

  updateCode = (_statements: any, change: any, cb = () => {}) => {
    const lastPosition = change && change.to
    this.setState(
      {
        lastPosition: lastPosition
          ? {
              line: lastPosition.line,
              column: lastPosition.ch
            }
          : this.state.lastPosition
      },
      cb
    )
  }
  setGutterMarkers() {
    if (this.codeMirror) {
      this.codeMirror.clearGutter('cypher-hints')
      this.state.notifications.forEach((notification: any) => {
        this.codeMirror.setGutterMarker(
          (notification.position.line || 1) - 1,
          'cypher-hints',
          (() => {
            const gutter = document.createElement('div')
            gutter.style.color = '#822'
            gutter.innerHTML =
              '<i class="fa fa-exclamation-triangle gutter-warning gutter-warning" aria-hidden="true"></i>'
            gutter.title = `${notification.title}\n${notification.description}`
            gutter.onclick = () => {
              const action =
                notification.code === 'frontendWarning'
                  ? add(notification)
                  : {
                      ...executeSystemCommand(notification.statement),
                      forceView: viewTypes.WARNINGS
                    }
              this.props.bus.send(action.type, action)
            }
            return gutter
          })()
        )
      })
    }
  }

  lineNumberFormatter = (line: any) => {
    if (this.codeMirror && this.codeMirror.lineCount() > 1) {
      return line
    } else {
      return `${this.props.useDb || ''}$`
    }
  }

  render() {
    const options = {
      lineNumbers: true,
      mode: this.state.mode,
      theme: 'cypher',
      gutters: ['cypher-hints'],
      lineWrapping: true,
      autofocus: true,
      smartIndent: false,
      lineNumberFormatter: this.lineNumberFormatter,
      lint: this.props.enableEditorLint,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Cmd-Up': this.historyPrev.bind(this),
        'Ctrl-Up': this.historyPrev.bind(this),
        Up: this.handleUp.bind(this),
        'Cmd-Down': this.historyNext.bind(this),
        'Ctrl-Down': this.historyNext.bind(this),
        'Cmd-/': this.execCommand.bind(this, ':help keys'),
        'Ctrl-/': this.execCommand.bind(this, ':help keys'),
        'Cmd-.': this.execCommand.bind(this, ':help keys'),
        'Ctrl-.': this.execCommand.bind(this, ':help keys'),
        Down: this.handleDown.bind(this)
      },
      hintOptions: {
        completeSingle: false,
        closeOnUnfocus: false,
        alignWithWord: true,
        async: true
      },
      autoCloseBrackets: {
        explode: ''
      },
      ...(!this.props.enableEditorAutocomplete ? { mode: '', theme: '' } : {})
    }

    this.setGutterMarkers()

    return (
      <Codemirror
        ref={ref => {
          this.editor = ref
        }}
        onParsed={this.updateCode}
        onChanges={this.props.onChange}
        options={options}
        schema={this.props.schema}
        initialPosition={this.state.lastPosition}
      />
    )
  }
}

const mapDispatchToProps = (_dispatch: any, ownProps: any) => {
  return {
    onExecute: (cmd: any) => {
      const action = executeCommand(cmd, { source: commandSources.editor }) // bubble to frame, but not clear
      ownProps.bus.send(action.type, action)
    }
  }
}

const mapStateToProps = (state: any) => {
  return {
    useDb: getUseDb(state),
    enableEditorAutocomplete: shouldEditorAutocomplete(state),
    enableEditorLint: shouldEditorLint(state),
    history: getHistory(state),
    schema: {
      parameters: Object.keys(state.params),
      labels: state.meta.labels.map(schemaConvert.toLabel),
      relationshipTypes: state.meta.relationshipTypes.map(
        schemaConvert.toRelationshipType
      ),
      propertyKeys: state.meta.properties.map(schemaConvert.toPropertyKey),
      functions: [
        ...cypherFunctions,
        ...state.meta.functions.map(schemaConvert.toFunction)
      ],
      procedures: state.meta.procedures.map(schemaConvert.toProcedure)
    },
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    isRelateAvailable: isRelateAvailable(state)
  }
}

export default withTheme(
  withBus(connect(mapStateToProps, mapDispatchToProps)(Editor))
)

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
import { FOCUS } from 'shared/modules/editor/editorDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import {
  shouldEditorAutocomplete,
  shouldEditorLint,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'
import { add } from 'shared/modules/stream/streamDuck'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { deepEquals, shallowEquals } from 'services/utils'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import Codemirror from './Codemirror'
import * as schemaConvert from './editorSchemaConverter'
import cypherFunctions from './cypher/functions'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'
import { isRelateAvailable } from 'shared/modules/app/appDuck'

export const shouldCheckForHints = (code: any) =>
  code.trim().length > 0 &&
  !code.trimLeft().startsWith(':') &&
  !code
    .trimLeft()
    .toUpperCase()
    .startsWith('EXPLAIN') &&
  !code
    .trimLeft()
    .toUpperCase()
    .startsWith('PROFILE')

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
    if (this.props.bus) {
      this.props.bus.take(FOCUS, this.focusEditor.bind(this))
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: EditorState) {
    return !(
      nextState.contentId === this.state.contentId &&
      shallowEquals(nextState.notifications, this.state.notifications) &&
      deepEquals(nextProps.schema, this.props.schema) &&
      nextProps.useDb === this.props.useDb &&
      nextProps.enableMultiStatementMode === this.props.enableMultiStatementMode
    )
  }

  focusEditor() {
    this.codeMirror.focus()
    this.codeMirror.setCursor(this.codeMirror.lineCount(), 0)
  }

  clearEditor = () => {
    this.setEditorValue('')
    this.setContentId(null)
  }

  handleEnter(cm: any) {
    const multiline = cm.lineCount() > 1
    if (multiline) {
      this.newlineAndIndent(cm)
    } else {
      this.execCurrent()
    }
  }

  newlineAndIndent(cm: any) {
    cm.execCommand('newlineAndIndent')
  }

  execCommand(cmd: any) {
    this.props.onExecute(cmd)
  }

  execCurrent = () => {
    const cmd = this.getEditorValue()
    const onlyWhitespace = cmd.trim() === ''

    if (!onlyWhitespace) {
      this.props.runCommand()
      this.clearEditor()
      this.setState({
        notifications: [],
        historyIndex: -1,
        buffer: null
      })
    }
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
    this.setEditorValue(this.props.history[this.state.historyIndex])
  }

  historyNext(_cm: any) {
    if (!this.props.history.length) return
    if (this.state.historyIndex <= -1) return
    if (this.state.historyIndex === 0) {
      // Should read from buffer
      this.setState({ historyIndex: -1 })
      this.setEditorValue(this.state.buffer)
      return
    }
    this.setState({
      historyIndex: this.state.historyIndex - 1
    })
    this.setEditorValue(this.props.history[this.state.historyIndex])
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

  setEditorValue(cmd: any) {
    this.codeMirror.setValue(cmd)
    this.updateCode(undefined, undefined, () => {
      this.focusEditor()
    })
  }

  setContentId(id: any) {
    this.setState({ contentId: id })
  }

  componentDidUpdate(prevProps: any) {
    if (
      prevProps.enableMultiStatementMode !== this.props.enableMultiStatementMode
    ) {
      // Set value to current value to trigger warning checks
      this.setEditorValue(this.getEditorValue())
    }
  }

  checkForMultiStatementWarnings(statements: any) {
    if (statements.length > 1 && !this.props.enableMultiStatementMode) {
      const { offset, line, column } = statements[1].start
      const message =
        'To use multi statement queries, please enable multi statement in the settings panel.'
      this.setState({
        notifications: [
          {
            code: 'frontendWarning',
            description: message,
            position: {
              offset,
              line,
              column
            },
            severity: 'WARNING',
            errors: {
              message
            },
            title: 'Multi Statement Query'
          }
        ]
      })
    } else {
      this.setState({ notifications: [] })
    }
  }

  updateCode = (statements: any, change: any, cb = () => {}) => {
    if (statements) {
      this.checkForHints(statements)
      this.checkForMultiStatementWarnings(statements)
    }

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

  checkForHints(statements: any) {
    if (!statements.length) return
    statements.forEach((stmt: any) => {
      const text = stmt.getText()
      if (!shouldCheckForHints(text)) {
        return
      }
      const offset = stmt.start.line - 1
      ;((text, offset) => {
        this.props.bus.self(
          CYPHER_REQUEST,
          {
            query: 'EXPLAIN ' + text,
            queryType: NEO4J_BROWSER_USER_ACTION_QUERY
          },
          (response: any) => {
            if (
              response.success === true &&
              response.result.summary.notifications.length > 0
            ) {
              const notifications = response.result.summary.notifications.map(
                (n: any) => ({
                  ...n,

                  position: {
                    ...n.position,
                    line: n.position.line + offset
                  },

                  statement: response.result.summary.query.text
                })
              )
              this.setState((state: any) => ({
                notifications: state.notifications.concat(notifications)
              }))
            }
          }
        )
      })(text, offset)
    })
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
        Enter: this.handleEnter.bind(this),
        'Shift-Enter': this.newlineAndIndent.bind(this),
        'Cmd-Enter': this.execCurrent.bind(this),
        'Ctrl-Enter': this.execCurrent.bind(this),
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
      const action = executeCommand(cmd, { source: commandSources.editor })
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

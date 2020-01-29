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

/* eslint-disable no-octal-escape */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import uuid from 'uuid'
import {
  executeCommand,
  executeSystemCommand
} from 'shared/modules/commands/commandsDuck'
import * as favorites from 'shared/modules/favorites/favoritesDuck'
import {
  SET_CONTENT,
  EDIT_CONTENT,
  FOCUS,
  EXPAND,
  editContent
} from 'shared/modules/editor/editorDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import {
  getCmdChar,
  shouldEditorAutocomplete,
  shouldEditorLint
} from 'shared/modules/settings/settingsDuck'
import { Bar, ActionButtonSection, EditorWrapper } from './styled'
import { EditorButton, EditModeEditorButton } from 'browser-components/buttons'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { deepEquals, shallowEquals } from 'services/utils'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'
import Codemirror from './Codemirror'
import * as schemaConvert from './editorSchemaConverter'
import cypherFunctions from './cypher/functions'
import Render from 'browser-components/Render'

import ratingStar from 'icons/rating-star.svg'
import controlsPlay from 'icons/controls-play.svg'
import eraser2 from 'icons/eraser-2.svg'
import pencil from 'icons/pencil.svg'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'

const shouldCheckForHints = code =>
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

export class Editor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      historyIndex: -1,
      buffer: '',
      mode: 'cypher',
      notifications: [],
      expanded: false,
      lastPosition: { line: 0, column: 0 },
      contentId: null,
      editorHeight: 0
    }

    if (this.props.bus) {
      this.props.bus.take(SET_CONTENT, msg => {
        this.setContentId(null)
        this.setEditorValue(msg.message)
      })
      this.props.bus.take(EDIT_CONTENT, msg => {
        this.setContentId(msg.id)
        this.setEditorValue(msg.message)
      })
      this.props.bus.take(FOCUS, this.focusEditor.bind(this))
      this.props.bus.take(EXPAND, this.expandEditorToggle.bind(this))
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      nextState.expanded === this.state.expanded &&
      nextState.contentId === this.state.contentId &&
      nextState.editorHeight === this.state.editorHeight &&
      shallowEquals(nextState.notifications, this.state.notifications) &&
      deepEquals(nextProps.schema, this.props.schema) &&
      nextProps.useDb === this.props.useDb
    )
  }

  focusEditor() {
    this.codeMirror.focus()
    this.codeMirror.setCursor(this.codeMirror.lineCount(), 0)
  }

  expandEditorToggle() {
    this.setState({ expanded: !this.state.expanded })
  }

  clearEditor() {
    this.setEditorValue('')
    this.setContentId(null)
  }

  handleEnter(cm) {
    if (cm.lineCount() === 1) {
      return this.execCurrent(cm)
    }
    this.newlineAndIndent(cm)
  }

  newlineAndIndent(cm) {
    cm.execCommand('newlineAndIndent')
  }

  execCommand(cmd) {
    this.props.onExecute(cmd)
  }

  execCurrent() {
    this.execCommand(this.getEditorValue())
    this.clearEditor()
    this.setState({
      notifications: [],
      historyIndex: -1,
      buffer: null,
      expanded: false
    })
  }

  moveCursorToEndOfLine(cm) {
    cm.setCursor(cm.lineCount(), 0)
  }

  handleUp(cm) {
    if (cm.lineCount() === 1) {
      this.historyPrev(cm)
      this.moveCursorToEndOfLine(cm)
    } else {
      cm.execCommand('goLineUp')
    }
  }

  handleDown(cm) {
    if (cm.lineCount() === 1) {
      this.historyNext(cm)
      this.moveCursorToEndOfLine(cm)
    } else {
      cm.execCommand('goLineDown')
    }
  }

  historyPrev(cm) {
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

  historyNext(cm) {
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

  triggerAutocompletion = (cm, changed) => {
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

  loadCodeMirror = () => {
    if (this.codeMirror) {
      return
    }
    if (!this.editor) {
      setTimeout(() => this.loadCodeMirror(), 200)
      return
    }
    this.codeMirror = this.editor.getCodeMirror()
    this.codeMirror.on('change', (cm, changed) => {
      try {
        this.triggerAutocompletion(cm, changed)
      } catch (e) {
        console.log(e)
      }
    })
  }

  getEditorValue() {
    return this.codeMirror ? this.codeMirror.getValue().trim() : ''
  }

  setEditorValue(cmd) {
    this.codeMirror.setValue(cmd)
    this.updateCode(undefined, undefined, () => {
      this.focusEditor()
    })
  }

  setContentId(id) {
    this.setState({ contentId: id })
  }

  updateCode = (statements, change, cb = () => {}) => {
    if (statements) this.checkForHints(statements)
    const lastPosition = change && change.to
    this.setState(
      {
        notifications: [],
        lastPosition: lastPosition
          ? { line: lastPosition.line, column: lastPosition.ch }
          : this.state.lastPosition
      },
      cb
    )
  }

  checkForHints(statements) {
    if (!statements.length) return
    statements.forEach(stmt => {
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
          response => {
            if (
              response.success === true &&
              response.result.summary.notifications.length > 0
            ) {
              const notifications = response.result.summary.notifications.map(
                n => ({
                  ...n,
                  position: { ...n.position, line: n.position.line + offset },
                  statement: response.result.summary.query.text
                })
              )
              this.setState(state => ({
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
      this.state.notifications.forEach(notification => {
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
              const action = executeSystemCommand(notification.statement)
              action.forceView = viewTypes.WARNINGS
              this.props.bus.send(action.type, action)
            }
            return gutter
          })()
        )
      })
    }
  }

  lineNumberFormatter = line => {
    const useDbString = this.props.useDb || ''
    if (!this.codeMirror || this.codeMirror.lineCount() === 1) {
      return `${useDbString}$`
    } else {
      return line
    }
  }

  updateHeight = () => {
    if (this.editor) {
      const editorHeight = this.editor.editorReference.clientHeight
      if (editorHeight !== this.state.editorHeight) {
        this.setState({ editorHeight })
      }
    }
  }

  render(cm) {
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
      <Bar expanded={this.state.expanded} minHeight={this.state.editorHeight}>
        <EditorWrapper
          expanded={this.state.expanded}
          minHeight={this.state.editorHeight}
        >
          <Codemirror
            ref={ref => {
              this.editor = ref
            }}
            onParsed={this.updateCode}
            onChanges={this.updateHeight}
            options={options}
            schema={this.props.schema}
            initialPosition={this.state.lastPosition}
          />
        </EditorWrapper>
        <ActionButtonSection>
          <Render if={this.state.contentId}>
            <EditModeEditorButton
              onClick={() =>
                this.props.onFavoriteUpdateClick(
                  this.state.contentId,
                  this.getEditorValue()
                )
              }
              disabled={this.getEditorValue().length < 1}
              color="#ffaf00"
              title="Favorite"
              icon={pencil}
            />
          </Render>
          <Render if={!this.state.contentId}>
            <EditorButton
              data-testid="editorFavorite"
              onClick={() => {
                this.props.onFavoriteClick(this.getEditorValue())
              }}
              disabled={this.getEditorValue().length < 1}
              title="Update favorite"
              icon={ratingStar}
            />
          </Render>
          <EditorButton
            data-testid="clearEditorContent"
            onClick={() => this.clearEditor()}
            disabled={this.getEditorValue().length < 1}
            title="Clear"
            icon={eraser2}
          />
          <EditorButton
            data-testid="submitQuery"
            onClick={() => this.execCurrent()}
            disabled={this.getEditorValue().length < 1}
            title="Play"
            icon={controlsPlay}
          />
        </ActionButtonSection>
      </Bar>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onFavoriteClick: cmd => {
      const id = uuid.v4()

      const addAction = favorites.addFavorite(cmd, id)
      ownProps.bus.send(addAction.type, addAction)

      const updateAction = editContent(id, cmd)
      ownProps.bus.send(updateAction.type, updateAction)
    },
    onFavoriteUpdateClick: (id, cmd) => {
      const action = favorites.updateFavorite(id, cmd)
      ownProps.bus.send(action.type, action)
    },
    onExecute: cmd => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

const mapStateToProps = state => {
  return {
    useDb: getUseDb(state),
    enableEditorAutocomplete: shouldEditorAutocomplete(state),
    enableEditorLint: shouldEditorLint(state),
    history: getHistory(state),
    cmdchar: getCmdChar(state),
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
    }
  }
}

export default withBus(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Editor)
)

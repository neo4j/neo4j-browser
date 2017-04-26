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

/* eslint-disable no-octal-escape */
import { Component } from 'preact'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { executeCommand, executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import * as favorites from 'shared/modules/favorites/favoritesDuck'
import { SET_CONTENT, FOCUS, EXPAND } from 'shared/modules/editor/editorDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import Codemirror from './Codemirror'
import 'codemirror/mode/cypher/cypher'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import { Bar, ExpandedBar, ActionButtonSection, EditorWrapper, EditorExpandedWrapper } from './styled'
import { EditorButton } from 'browser-components/buttons'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { debounce } from 'services/utils'
import * as viewTypes from 'shared/modules/stream/frameViewTypes'

export class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      code: props.content || '',
      historyIndex: -1,
      buffer: '',
      mode: 'cypher',
      notifications: [],
      expanded: false,
      lastPosition: {line: 0, column: 0}
    }
  }
  focusEditor () {
    const cm = this.codeMirror
    cm.focus()
    cm.setCursor(cm.lineCount(), 0)
  }
  expandEditorToggle () {
    this.setState({expanded: !this.state.expanded})
  }
  clearEditor () {
    this.setEditorValue(this.codeMirror, '')
  }
  handleEnter (cm) {
    if (cm.lineCount() === 1) {
      return this.execCurrent(cm)
    }
    this.newlineAndIndent(cm)
  }
  newlineAndIndent (cm) {
    this.codeMirrorInstance.commands.newlineAndIndent(cm)
  }
  execCurrent () {
    const value = this.codeMirror.getValue().trim() || this.state.code
    if (!value) return
    this.props.onExecute(value)
    this.clearEditor()
    this.clearHints()
    this.setState({historyIndex: -1, buffer: null, expanded: false})
  }
  historyPrev (cm) {
    if (!this.props.history.length) return
    if (this.state.historyIndex + 1 === this.props.history.length) return
    if (this.state.historyIndex === -1) { // Save what's currently in the editor
      this.setState({buffer: cm.getValue()})
    }
    this.setState({ historyIndex: this.state.historyIndex + 1, editorHeight: this.editor && this.editor.base.clientHeight })
    this.setEditorValue(cm, this.props.history[this.state.historyIndex].cmd)
  }
  historyNext (cm) {
    if (!this.props.history.length) return
    if (this.state.historyIndex <= -1) return
    if (this.state.historyIndex === 0) { // Should read from buffer
      this.setState({historyIndex: -1})
      this.setEditorValue(cm, this.state.buffer)
      return
    }
    this.setState({ historyIndex: this.state.historyIndex - 1, editorHeight: this.editor && this.editor.base.clientHeight })
    this.setEditorValue(cm, this.props.history[this.state.historyIndex].cmd)
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.content !== null && nextProps.content !== this.state.code) {
      this.setEditorValue(this.codeMirror, nextProps.content)
    }
  }
  componentDidMount () {
    this.debouncedCheckForHints = debounce(this.checkForHints, 350, this)
    this.codeMirror = this.editor.getCodeMirror()
    this.codeMirrorInstance = this.editor.getCodeMirrorInstance()
    this.codeMirrorInstance.keyMap['default']['Enter'] = this.handleEnter.bind(this)
    this.codeMirrorInstance.keyMap['default']['Shift-Enter'] = this.newlineAndIndent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Enter'] = this.execCurrent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Enter'] = this.execCurrent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Up'] = this.historyPrev.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Up'] = this.historyPrev.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Down'] = this.historyNext.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Down'] = this.historyNext.bind(this)
    if (this.props.bus) {
      this.props.bus.take(SET_CONTENT, (msg) => {
        this.setEditorValue(this.codeMirror, msg.message)
      })
      this.props.bus.take(FOCUS, this.focusEditor.bind(this))
      this.props.bus.take(EXPAND, this.expandEditorToggle.bind(this))
    }
  }
  setEditorValue (cm, cmd) {
    this.codeMirror.setValue(cmd)
    this.updateCode(cmd, () => this.focusEditor())
  }
  updateCode (newCode, change, cb = () => {}) {
    const mode = this.props.cmdchar && newCode.trim().indexOf(this.props.cmdchar) === 0
      ? 'text'
      : 'cypher'
    this.clearHints()
    if (mode === 'cypher' &&
        newCode.trim().length > 0 &&
        !newCode.trimLeft().toUpperCase().startsWith('EXPLAIN') &&
        !newCode.trimLeft().toUpperCase().startsWith('PROFILE')
    ) {
      this.debouncedCheckForHints(newCode)
    }

    const lastPosition = change && change.to

    this.setState({
      code: newCode,
      mode,
      lastPosition: lastPosition ? {line: lastPosition.line, column: lastPosition.ch} : this.state.lastPosition,
      editorHeight: this.editor && this.editor.base.clientHeight
    }, cb)
  }
  checkForHints (code) {
    this.props.bus.self(
      CYPHER_REQUEST,
      {query: 'EXPLAIN ' + code},
      (response) => {
        if (response.success === true && response.result.summary.notifications.length > 0) {
          this.setState({ notifications: response.result.summary.notifications })
        } else {
          this.clearHints()
        }
      }
    )
  }
  clearHints () {
    this.setState({ notifications: [] })
  }
  setGutterMarkers () {
    if (this.codeMirror) {
      this.codeMirror.clearGutter('cypher-hints')
      this.state.notifications.forEach(notification => {
        this.codeMirror.setGutterMarker(notification.position.line - 1, 'cypher-hints', (() => {
          let gutter = document.createElement('div')
          gutter.style.color = '#822'
          gutter.innerHTML = '<i class="fa fa-exclamation-triangle gutter-warning gutter-warning" aria-hidden="true"></i>'
          gutter.title = `${notification.title}\n${notification.description}`
          gutter.onclick = () => {
            const action = executeSystemCommand(`EXPLAIN ${this.state.code}`)
            action.forceView = viewTypes.WARNINGS
            this.props.bus.send(action.type, action)
          }
          return gutter
        })())
      })
    }
  }
  lineNumberFormatter (line) {
    if (!this.codeMirror || this.codeMirror.lineCount() === 1) {
      return '$'
    } else {
      return line
    }
  }

  componentDidUpdate () {
    if (this.editor) {
      const editorHeight = this.editor.base.clientHeight
      if (editorHeight !== this.state.editorHeight) {
        this.setState({ editorHeight })
      }
    }
  }

  render () {
    const options = {
      lineNumbers: true,
      mode: this.state.mode,
      theme: 'neo',
      gutters: ['cypher-hints'],
      lineWrapping: true,
      autofocus: true,
      smartIndent: false,
      lineNumberFormatter: this.lineNumberFormatter.bind(this)
    }

    const updateCode = (val, change) => this.updateCode(val, change)
    this.setGutterMarkers()
    const wrapper = (this.state.expanded) ? {Component: EditorExpandedWrapper} : {Component: EditorWrapper}
    const bar = (this.state.expanded) ? {Component: ExpandedBar} : {Component: Bar}

    return (
      <bar.Component minHeight={this.state.editorHeight}>
        <wrapper.Component minHeight={this.state.editorHeight}>
          <Codemirror
            ref={(ref) => { this.editor = ref }}
            value={this.state.code}
            onChange={updateCode}
            options={options}
            initialPosition={this.state.lastPosition}
          />
        </wrapper.Component>
        <ActionButtonSection>
          <EditorButton
            onClick={() => this.props.onFavortieClick(this.state.code)}
            disabled={this.state.code.length < 1}
            tooltip='Add as favorite'
            hoverIcon='"\58"'
            icon='"\73"'
           />
          <EditorButton
            onClick={() => this.clearEditor()}
            disabled={this.state.code.length < 1}
            tooltip='Clear editor contents'
            hoverIcon='"\e005"'
            icon='"\5e"'
           />
          <EditorButton
            onClick={() => this.execCurrent()}
            disabled={this.state.code.length < 1}
            tooltip='Execute command'
            hoverIcon='"\e002"'
            icon='"\77"'
           />
        </ActionButtonSection>
      </bar.Component>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onFavortieClick: (cmd) => {
      const action = favorites.addFavorite(cmd)
      ownProps.bus.send(action.type, action)
    },
    onExecute: (cmd) => {
      const action = executeCommand(cmd)
      ownProps.bus.send(action.type, action)
    }
  }
}

const mapStateToProps = (state) => {
  return {
    content: null,
    history: getHistory(state),
    cmdchar: getSettings(state).cmdchar
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(Editor))

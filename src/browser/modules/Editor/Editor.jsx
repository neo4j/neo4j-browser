import { Component } from 'preact'
import { connect } from 'preact-redux'
import { withBus } from 'preact-suber'
import { executeCommand, executeSystemCommand } from 'shared/modules/commands/commandsDuck'
import * as favorites from 'shared/modules/favorites/favoritesDuck'
import { SET_CONTENT } from 'shared/modules/editor/editorDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { getSettings } from 'shared/modules/settings/settingsDuck'
import Codemirror from './Codemirror'
import 'codemirror/mode/cypher/cypher'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'
import { Bar, ActionButtonSection, EditorWrapper } from './styled'
import { EditorButton } from 'browser-components/buttons'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import { debounce } from 'services/utils'

export class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      code: props.content || '',
      historyIndex: -1,
      buffer: '',
      mode: 'cypher',
      notifications: []
    }
  }
  focusEditor () {
    const cm = this.codeMirror
    cm.focus()
    cm.setCursor(cm.lineCount(), 0)
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
    const value = this.codeMirror.getValue().trim()
    if (!value) return
    this.props.onExecute(value)
    this.clearEditor()
    this.clearHints()
    this.setState({historyIndex: -1, buffer: null})
  }
  historyPrev (cm) {
    if (!this.props.history.length) return
    if (this.state.historyIndex + 1 === this.props.history.length) return
    if (this.state.historyIndex === -1) { // Save what's currently in the editor
      this.setState({buffer: cm.getValue()})
    }
    this.setState({historyIndex: this.state.historyIndex + 1})
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
    this.setState({historyIndex: this.state.historyIndex - 1})
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
    }
  }
  setEditorValue (cm, cmd) {
    this.codeMirror.setValue(cmd)
    this.updateCode(cmd, () => this.focusEditor())
  }
  updateCode (newCode, cb = () => {}) {
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

    this.setState({
      code: newCode,
      mode
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
            action.forceFrame = 'warnings'
            this.props.bus.send(action.type, action)
          }
          return gutter
        })())
      })
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
      smartIndent: false
    }

    const updateCode = (val) => this.updateCode(val)
    this.setGutterMarkers()
    return (
      <Bar>
        <EditorWrapper>

          <Codemirror
            ref={(ref) => { this.editor = ref }}
            value={this.state.code}
            onChange={updateCode}
            options={options}
          />
        </EditorWrapper>
        <ActionButtonSection>
          <EditorButton
            onClick={() => this.props.onFavortieClick(this.state.code)}
            disabled={this.state.code.length < 1}
            tooltip='Add as favorite'
          >&#9734;</EditorButton>
          <EditorButton
            onClick={() => this.clearEditor()}
            disabled={this.state.code.length < 1}
            tooltip='Clear editor contents'
          >&times;</EditorButton>
          <EditorButton
            onClick={() => this.execCurrent()}
            disabled={this.state.code.length < 1}
            tooltip='Execute command'
          >&#9654;</EditorButton>
        </ActionButtonSection>
      </Bar>
    )
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onFavortieClick: (cmd) => {
      dispatch(favorites.addFavorite(cmd))
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

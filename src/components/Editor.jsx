import React from 'react'
import Codemirror from 'react-codemirror'
import 'codemirror/mode/cypher/cypher'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/monokai.css'

export default class Editor extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      code: ''
    }
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
  execCurrent (cm) {
    console.log('Executing')
  }
  componentDidMount () {
    this.codeMirror = this.refs.editor.getCodeMirror()
    this.codeMirrorInstance = this.refs.editor.getCodeMirrorInstance()
    this.codeMirrorInstance.keyMap['default']['Enter'] = this.handleEnter.bind(this)
    this.codeMirrorInstance.keyMap['default']['Shift-Enter'] = this.newlineAndIndent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Cmd-Enter'] = this.execCurrent.bind(this)
    this.codeMirrorInstance.keyMap['default']['Ctrl-Enter'] = this.execCurrent.bind(this)
  }
  updateCode (newCode) {
    this.setState({
      code: newCode
    })
  }
  render () {
    const options = {
      lineNumbers: true,
      mode: 'cypher',
      theme: 'neo',
      gutters: ['cypher-hints'],
      lineWrapping: true,
      autofocus: true
    }
    return (
      <div id='editor'>
        <Codemirror
          ref='editor'
          value={this.state.code}
          onChange={this.updateCode.bind(this)}
          options={options}
        />
      </div>
    )
  }
}

import { Component } from 'preact'
import {NativeTypes} from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
import { wrapWithDndContext } from './dndGlobalContext'

const fileTarget = {
  drop (props, monitor) {
    console.log('Hello in drop')
    const file = monitor.getItem().files[0]
    if (file.name.endsWith(`.${props.expectedExtension}`)) {
      const fileReader = new FileReader()
      fileReader.onloadend = (evt) => {
        props.onImportSuccess(evt.target.result)
      }
      fileReader.readAsText(file)
      return {message: `Imported file: ${file.name}`}
    } else {
      return {message: `File not imported. Expected File to have an extension of '${props.expectedExtension}'`}
    }
  }
}

class FileDropZone extends Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.initialMessage || 'Drop a file here to import'
    }
  }

  componentWillUpdate () {
    const result = this.props.getDropResult
    if (result && result.message) {
      this.setState({text: result.message})
    }
  }
  render () {
    return this.props.connectDropTarget(
      <div className='stuff'>
        <this.props.Component text={this.state.text} />
      </div>
    )
  }
}

export const FileDrop = (Component, applyContext) => {
  let WrappedComponent = (props) => {
    return (<FileDropZone {...props} Component={Component} />)
  }
  const Target = DropTarget(NativeTypes.FILE, fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    getDropResult: monitor.getDropResult()
  }))(WrappedComponent)
  return wrapWithDndContext(Target)
}

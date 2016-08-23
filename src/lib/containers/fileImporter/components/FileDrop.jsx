import React from 'react'
import HTML5Backend, {NativeTypes} from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
import { DropTarget } from 'react-dnd'

const fileTarget = {
  drop (props, monitor) {
    const file = monitor.getItem().files[0]
    const fileReader = new FileReader()
    fileReader.onloadend = (evt) => {
      props.onImportSuccess(evt.target.result)
    }
    fileReader.readAsText(file)
    return {filename: file.name}
  }
}

class FileDropZone extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      text: props.initialMessage || 'Drop a file here to import'
    }
  }

  componentWillUpdate () {
    const result = this.props.getDropResult
    if (result) {
      this.setState({text: `Imported file: ${result.filename}`})
    }
  }
  render () {
    return this.props.connectDropTarget(
      <div>
        <this.props.Component text={this.state.text}/>
      </div>
    )
  }
}

export const FileDrop = (Component, applyContext) => {
  let WrappedComponent = (props) => {
    return (<FileDropZone {...props} Component={Component}/>)
  }
  const Target = DropTarget(NativeTypes.FILE, fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    canDrop: monitor.canDrop(),
    getDropResult: monitor.getDropResult()
  }))(WrappedComponent)
  if (applyContext) {
    return DragDropContext(HTML5Backend)(Target)
  } else return Target
}

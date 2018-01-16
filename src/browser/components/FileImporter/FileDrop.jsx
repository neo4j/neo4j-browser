/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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
import { NativeTypes } from 'react-dnd-html5-backend'
import { DropTarget } from 'react-dnd'
import { wrapWithDndContext } from './dndGlobalContext'

const fileTarget = {
  drop (props, monitor) {
    const file = monitor.getItem().files[0]
    if (file.name.endsWith(`.${props.expectedExtension}`)) {
      const fileReader = new FileReader()
      fileReader.onloadend = evt => {
        props.onImportSuccess(evt.target.result)
      }
      fileReader.readAsText(file)
      return { message: `Imported file: ${file.name}` }
    } else {
      return {
        message: `File not imported. Expected File to have an extension of '${props.expectedExtension}'`
      }
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
      this.setState({ text: result.message })
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
  let WrappedComponent = props => {
    return <FileDropZone {...props} Component={Component} />
  }
  const Target = DropTarget(
    NativeTypes.FILE,
    fileTarget,
    (connect, monitor) => ({
      connectDropTarget: connect.dropTarget(),
      canDrop: monitor.canDrop(),
      getDropResult: monitor.getDropResult()
    })
  )(WrappedComponent)
  return wrapWithDndContext(Target)
}

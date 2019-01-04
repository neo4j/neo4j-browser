/*
 * Copyright (c) 2002-2019 "Neo4j,"
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

/* global FileReader */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'

import { addFavorite } from 'shared/modules/favorites/favoritesDuck'
import { parseGrass } from 'shared/services/grassUtils'
import { updateGraphStyleData } from 'shared/modules/grass/grassDuck'
import { showErrorMessage } from 'shared/modules/commands/commandsDuck'

import { StyledDropzoneText } from './styled'

export class FileDrop extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      success: null
    }
    this.favoriteExtensions = ['cyp', 'cypher', 'cql', 'txt']
    this.grassExtensions = ['grass']
    this.fileReader = this.props.fileReader || new FileReader()
  }
  onDrop (files) {
    this.setState({ error: null, success: null })

    const file = files[0]
    const fileExtension = file.name.split('.').pop()

    let loader = () => {}
    if (this.favoriteExtensions.includes(fileExtension)) {
      loader = this.props.onFavoriteFileDropped
    } else if (this.grassExtensions.includes(fileExtension)) {
      loader = this.props.onGrassFileDropped
    } else {
      return this.setState({
        error: `'.${fileExtension}' is not a valid file extension`
      })
    }

    this.fileReader.onload = () => {
      loader(this.fileReader.result)
      this.setState({ success: `'${file.name}' has been added` })
    }
    this.fileReader.readAsText(file)
  }
  render () {
    return (
      <Dropzone disableClick multiple={false} onDrop={this.onDrop.bind(this)}>
        <StyledDropzoneText>
          {this.state.error ||
            this.state.success ||
            'Drop a file to import Cypher (*.cyp, *.cypher, *.cql, *.txt) or Grass (*.grass)'}
        </StyledDropzoneText>
      </Dropzone>
    )
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onFavoriteFileDropped: fileContent => {
      dispatch(addFavorite(fileContent))
    },
    onGrassFileDropped: fileContent => {
      const parsedGrass = parseGrass(fileContent)
      if (parsedGrass) {
        dispatch(updateGraphStyleData(parsedGrass))
      } else {
        dispatch(showErrorMessage('Could not parse grass data'))
      }
    }
  }
}
export default connect(
  null,
  mapDispatchToProps
)(FileDrop)

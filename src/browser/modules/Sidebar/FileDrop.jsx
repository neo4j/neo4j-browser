import React from 'react'
import { connect } from 'react-redux'
import Dropzone from 'react-dropzone'

import * as favorites from 'shared/modules/favorites/favoritesDuck'

export class FileDrop extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      error: null,
      success: null
    }
    this.validExtensions = ['cyp', 'cypher', 'cql', 'txt']
  }
  onDrop (files) {
    this.setState({error: null, success: null})

    const file = files[0]
    const fileExtension = file.name.split('.').pop()

    if (!this.validExtensions.includes(fileExtension)) {
      return this.setState({'error': `'.${fileExtension}' is not a valid file extension`})
    }

    const fileReader = new FileReader()
    fileReader.onload = () => {
      this.props.onFileDropped(fileReader.result)
      this.setState({'success': `'${file.name}' has been added`})
    }
    fileReader.readAsText(file)
  }
  render () {
    return (
      <Dropzone
        disableClick
        multiple={false}
        onDrop={this.onDrop.bind(this)}>
        <div>{this.state.error || this.state.success || 'Drop a file to import Cypher'}</div>
      </Dropzone>)
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onFileDropped: (fileContent) => {
      dispatch(favorites.addFavorite(fileContent))
    }
  }
}
export default connect(null, mapDispatchToProps)(FileDrop)

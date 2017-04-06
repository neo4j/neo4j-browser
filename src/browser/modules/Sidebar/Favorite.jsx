import { connect } from 'preact-redux'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import {FavoriteItem, FavoriteList} from 'browser-components/buttons'
import { withBus } from 'preact-suber'
import { Component } from 'preact'

function extractNameFromCommand (input) {
  if (!input) {
    return ''
  }

  let firstRow = input.split('\n')[0]
  if (firstRow.indexOf('//') === 0) {
    return firstRow.substr(2).trim()
  } else {
    return input.trim()
  }
}

export class Folder extends Component {
  render () {
    return <FavoriteList {...this.props} active={this.state.active}
      onClick={() => this.setState({active: !this.state.active})} />
  }
}

export const Favorite = ({id, content, onItemClick, removeClick, isChild, isStatic}) => {
  const name = extractNameFromCommand(content)
  return (
    <FavoriteItem
      primaryText={name}
      onClick={() => onItemClick(content)}
      removeClick={() => removeClick(id)}
      isChild={isChild}
      isStatic={isStatic}
    />
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    removeClick: (id) => {
      dispatch(favorite.removeFavorite(id))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(Favorite))

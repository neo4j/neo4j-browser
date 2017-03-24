import { connect } from 'preact-redux'
import * as favorite from 'shared/modules/favorites/favoritesDuck'
import {FavoriteItem} from 'browser-components/buttons'
import { withBus } from 'preact-suber'

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

export const Favorite = ({id, content, onItemClick, removeClick}) => {
  const name = extractNameFromCommand(content)
  return (
    <FavoriteItem
      primaryText={name}
      onClick={() => onItemClick(content)}
      removeClick={() => removeClick(id)}
    />
  )
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    removeClick: (id) => {
      const action = favorite.removeFavorite(id)
      ownProps.bus.send(action.type, action)
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(Favorite))

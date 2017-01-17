import React from 'react'
import { connect } from 'react-redux'
import editor from 'containers/editor'
import favorite from '../'
import {FavoriteItem} from 'nbnmui/buttons'

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

export const Favorite = ({id, content, onItemClick = () => {}, removeClick = () => {}}) => {
  const name = extractNameFromCommand(content)
  return (
    <FavoriteItem
      style={{color: 'white'}}
      className='favorite'
      primaryText={name}
      onClick={() => onItemClick(content)}
      removeClick={() => removeClick(id)}
    />
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    },
    removeClick: (id) => {
      dispatch(favorite.actions.removeFavorite(id))
    }
  }
}

export default connect(null, mapDispatchToProps)(Favorite)

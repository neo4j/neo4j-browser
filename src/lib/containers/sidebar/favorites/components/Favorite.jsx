import React from 'react'
import { connect } from 'react-redux'
import editor from '../../../editor'
import favorite from '../'

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

const FavoriteComponent = ({id, content, onItemClick = () => {}, removeClick = () => {}}) => {
  const name = extractNameFromCommand(content)
  return (
    <div>
      <div className='favorite' onClick={() => onItemClick(content)}>{name}</div>
      <button className='remove' onClick={() => removeClick(id)}>
        {'x'}
      </button>
    </div>
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

const Favorite = connect(null, mapDispatchToProps)(FavoriteComponent)
export {
  FavoriteComponent,
  Favorite
}

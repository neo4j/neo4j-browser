import React from 'react'
import { connect } from 'react-redux'
import editor from '../../../main/editor'
import favorite from '../'

const FavoriteComponent = ({name, id, content, onItemClick = () => {}, removeClick = () => {}}) => {
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

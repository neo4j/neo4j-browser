import React from 'react'
import { connect } from 'react-redux'
import editor from '../../../main/editor'

const FavoriteComponent = ({name, content, onItemClick = () => {}}) => {
  return <div className='favorite' onClick={() => onItemClick(content)}>{name}</div>
}

const mapDispatchToProps = (dispatch) => {
  return {
    onItemClick: (cmd) => {
      dispatch(editor.actions.setContent(cmd))
    }
  }
}

const Favorite = connect(null, mapDispatchToProps)(FavoriteComponent)
export {
  FavoriteComponent,
  Favorite
}

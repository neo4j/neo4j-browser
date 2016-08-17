import React from 'react'
import { connect } from 'react-redux'
import editor from '../../../editor'
import favorite from '../'
import RaisedButton from 'material-ui/RaisedButton'
import {ListItem} from 'material-ui/List'

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
    <ListItem
      style={{color: 'white'}}
      primaryText={name}
      className='favorite'
      onClick={() => onItemClick(content)}
      rightIcon={<RaisedButton className='remove' onClick={() => removeClick(id)}>×</RaisedButton>}
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

const Favorite = connect(null, mapDispatchToProps)(FavoriteComponent)
export {
  FavoriteComponent,
  Favorite
}

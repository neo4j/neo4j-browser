import React from 'react'
import {ListItem} from 'material-ui/List'
import RaisedButton from 'material-ui/RaisedButton'
import styles from './style.css'

export const CloseButton = (props) => {
  return (
    <RaisedButton {...props} className={styles.icon}>×</RaisedButton>
  )
}
export const EditorButton = (props) => {
  return (
    <RaisedButton {...props}/>
  )
}
export const FavoriteItem = (props) => {
  const primaryText = (<p>{props.primaryText}</p>)
  const rightIcon = (props.removeClick) ? (<CloseButton onClick={props.removeClick} />) : null
  return (
    <ListItem className='remove' {...props}
      primaryText={primaryText}
      rightIconButton={rightIcon}
    />
  )
}

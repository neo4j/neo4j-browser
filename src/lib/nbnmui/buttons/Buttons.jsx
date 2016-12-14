import React from 'react'
import {ListItem} from 'grommet/components/List'
import Button from 'grommet/components/Button'

import styles from './style.css'

export const CloseButton = (props) => {
  return (
    <Button {...props} className={styles.icon}>×</Button>
  )
}
export const EditorButton = (props) => {
  return (
    <Button {...props}/>
  )
}
export const FavoriteItem = (props) => {
  const primaryText = (<p>{props.primaryText}</p>)
  const rightIcon = (props.removeClick) ? (<CloseButton onClick={props.removeClick} />) : null
  return (
    <ListItem className='remove'
      rightIconButton={rightIcon}
    >
      <ListItemContent {...props}>
        {primaryText}
      </ListItemContent>
      <ListItemAction>
        {rightIcon}
      </ListItemAction>
    </ListItem>
  )
}

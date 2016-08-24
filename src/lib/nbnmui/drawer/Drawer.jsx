import React from 'react'
import {List} from 'material-ui/List'
import {Toolbar, ToolbarTitle} from 'material-ui/Toolbar'
import styles from './style.css'

export const Drawer = (props) => {
  return <div className={styles.drawer} {...props}/>
}
export const DrawerHeader = ({title}) => {
  return (
    <Toolbar className={styles.bar}>
      <ToolbarTitle className={styles.title} text={title} />
    </Toolbar>
  )
}

export const DrawerBody = (props) => {
  return (
    <List {...props} className={styles.drawerBody}/>
  )
}

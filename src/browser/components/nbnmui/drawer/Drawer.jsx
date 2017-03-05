import React from 'react'

import { H4 } from 'nbnmui/headers'
import styles from './style.css'

export const Drawer = (props) => {
  return <div className={styles.drawer} {...props} />
}
export const DrawerHeader = ({title}) => {
  return (
    <H4 className={styles.bar}>
      {title}
    </H4>
  )
}

export const DrawerBody = (props) => {
  return (
    <ul className={styles.drawerBody}>{props.children}</ul>
  )
}

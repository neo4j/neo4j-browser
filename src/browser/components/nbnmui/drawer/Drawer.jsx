import React from 'react'
import List from 'grommet/components/List'
import Heading from 'grommet/components/Heading'
import styles from './style.css'

export const Drawer = (props) => {
  return <div className={styles.drawer} {...props} />
}
export const DrawerHeader = ({title}) => {
  return (
    <Heading className={styles.bar}>
      {title}
    </Heading>
  )
}

export const DrawerBody = (props) => {
  return (
    <List {...props} className={styles.drawerBody} />
  )
}

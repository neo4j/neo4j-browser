import React from 'react'
import List from 'grommet/components/List'
import Header from 'grommet/components/Header'
import Title from 'grommet/components/Title'
import styles from './style.css'

export const Drawer = (props) => {
  return <div className={styles.drawer} {...props} />
}
export const DrawerHeader = ({title}) => {
  return (
    <Header className={styles.bar}>
      <Title className={styles.title} text={title} />
    </Header>
  )
}

export const DrawerBody = (props) => {
  return (
    <List {...props} className={styles.drawerBody} />
  )
}

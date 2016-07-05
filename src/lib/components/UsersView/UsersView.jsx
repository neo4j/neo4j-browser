import React from 'react'
import user from '../../containers/user'
import styles from './style.css'

const UsersView = () => {
  return (
    <div className={styles.userinfoView}>
      <div className={styles.userinfoCard}>
        <user.components.UserInfo />
        <user.components.ListUsers />
      </div>
    </div>
  )
}

export default UsersView

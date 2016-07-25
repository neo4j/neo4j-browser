import React from 'react'
import styles from './style.css'

import main from '../../main'
import leftnav from '../../leftnav'

const BaseLayout = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.app}>
        <div className={styles.body}>
          <leftnav.components.LeftNav
            className={styles.leftNav}
            activeClassName={styles.activeLeftNav}
            separatorClassName={styles.menuSeparator}
          />
          <div className={styles.mainContent}>
            <main.components.Main />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseLayout

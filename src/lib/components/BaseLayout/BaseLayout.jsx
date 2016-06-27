import React from 'react'
import styles from './style.css'

import Main from '../Main'
import bookmarks from '../../containers/bookmarks'
import leftnav from '../../containers/leftnav'

const BaseLayout = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.app}>
        <div className={styles.topBanner}>
          <div className={styles.bookmarkChooser}>
            <bookmarks.components.Dropdown />
          </div>
        </div>
        <div className={styles.body}>
          <leftnav.components.LeftNav
            className={styles.leftNav}
            activeClassName={styles.activeLeftNav}
            separatorClassName={styles.menuSeparator}
          />
          <div className={styles.mainContent}>
            <Main />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseLayout

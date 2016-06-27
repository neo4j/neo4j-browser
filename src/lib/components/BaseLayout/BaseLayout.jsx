import React from 'react'
import styles from './style.css'

import main from '../../../main'
import bookmarks from '../Bookmarks'
import leftnav from '../LeftNav'

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
          <leftnav.components.LeftNavOnline
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

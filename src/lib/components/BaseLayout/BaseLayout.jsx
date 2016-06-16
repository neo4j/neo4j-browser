import React from 'react'
import styles from './style.css'

import main from '../../../main'
import { LeftNavOnline } from '../LeftNav'

const BaseLayout = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.app}>
        <div className={styles.topBanner}>
          <div className={styles.bookmarkChooser}>
            My Bookmark v
          </div>
        </div>
        <div className={styles.body}>
          <LeftNavOnline
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

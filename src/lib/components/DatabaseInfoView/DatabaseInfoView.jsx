import React from 'react'
import dbInfo from '../../containers/dbInfo'
import styles from './style.css'

const QueryView = () => {
  return (
    <div className={styles.dbinfoView}>
      <div className={styles.dbinfoCard}>
        <dbInfo.components.DatabaseInfo />
      </div>
    </div>
  )
}

export default QueryView

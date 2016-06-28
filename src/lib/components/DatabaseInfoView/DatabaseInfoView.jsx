import React from 'react'
import editor from '../../containers/editor'
import dbInfo from '../../containers/dbInfo'
import styles from './style.css'

const QueryView = () => {
  return (
    <div className={styles.dbinfoView}>
      <editor.components.Editor />
      <div className={styles.dbinfoCard}>
        <dbInfo.components.DatabaseInfo />
      </div>
    </div>
  )
}

export default QueryView

import React from 'react'
import editor from '../../containers/editor'
import frames from '../../containers/frames'
import styles from './style.css'

const QueryView = () => {
  return (
    <div className={styles.queryView}>
      <editor.components.Editor />
      <frames.components.Stream />
    </div>
  )
}

export default QueryView

import React from 'react'
import editor from 'containers/editor'
import frames from 'containers/frames'
import styles from './style.css'

const Main = (props) => {
  return (
    <div className={styles.main}>
      <editor.components.Editor />
      <frames.components.Stream />
    </div>
  )
}

export default Main

import React from 'react'
import Editor from '../Editor'
import Frames from '../Stream'
import styles from './style.css'

const Main = (props) => {
  return (
    <div className={styles.main}>
      <Editor />
      <Stream />
    </div>
  )
}

export default Main

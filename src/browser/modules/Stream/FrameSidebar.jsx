import React from 'react'

import styles from './style_sidebar.css'

const FrameSidebar = (props) => {
  if (!props || !props.children) return null
  return <div className={styles.sidebar}>{props.children}</div>
}

export default FrameSidebar

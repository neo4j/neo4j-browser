import React from 'react'
import Card from 'grommet/components/Card'

import styles from './style_frame.css'

const FrameTemplate = ({header, contents}) => {
  return (
    <Card className={styles.frame} heading={header}>
      <div className={styles.contents + ' frame-contents'}>
        {contents}
      </div>
    </Card>
  )
}

export default FrameTemplate

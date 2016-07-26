import React from 'react'
import { Card, CardHeader } from 'material-ui/Card'

import styles from './style_frame.css'

const FrameTemplate = ({header, contents}) => {
  return (
    <Card className={styles.frame}>
      <CardHeader children={header} />
      <div className={styles.contents + ' frame-contents'}>
        {contents}
      </div>
    </Card>
  )
}

export default FrameTemplate

import React from 'react'
import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card'

import styles from './style_frame.css'

const FrameTemplate = ({header, contents}) => {
  return (
    <Card className={styles.frame}>
      <CardHeader children={header} />
      <div className={styles.contents}>
        {contents}
      </div>
    </Card>
  )
}

export default FrameTemplate

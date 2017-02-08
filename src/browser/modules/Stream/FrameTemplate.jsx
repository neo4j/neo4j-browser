import React from 'react'
import Article from 'grommet/components/Article'
import Section from 'grommet/components/Section'
import Split from 'grommet/components/Split'

import styles from './style_frame.css'

const FrameTemplate = ({header, contents, sidebar}) => {
  return (
    <Article className={styles.frame}>
      {header}
      <Split flex='right' className={styles.framebody}>
        {(sidebar) ? sidebar() : null}
        <Section className={styles.contents + ' frame-contents'}>
          {contents}
        </Section>
      </Split>
    </Article>
  )
}

export default FrameTemplate

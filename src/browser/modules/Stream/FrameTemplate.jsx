import React from 'react'
import Article from 'grommet/components/Article'
import Header from 'grommet/components/Header'
import Section from 'grommet/components/Section'

import styles from './style_frame.css'

const FrameTemplate = ({header, contents}) => {
  return (
    <Article className={styles.frame}>
      <Header className={styles.frameHeader}>
        {header}
      </Header>
      <Section className={styles.contents + ' frame-contents'}>
        {contents}
      </Section>
    </Article>
  )
}

export default FrameTemplate

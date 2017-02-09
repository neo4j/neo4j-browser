import React from 'react'
import Article from 'grommet/components/Article'
import Section from 'grommet/components/Section'
import Split from 'grommet/components/Split'
import FrameTitlebar from './FrameTitlebar'

import styles from './style_frame.css'

class FrameTemplate extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      fullscreen: false
    }
  }
  toggleFullScreen () {
    this.setState({fullscreen: !this.state.fullscreen})
  }
  render () {
    const fullscreenClass = (this.state.fullscreen) ? styles.fullscreen : ''
    return (
      <Article className={styles.frame + ' ' + fullscreenClass}>
        <FrameTitlebar
          frame={this.props.header}
          fullscreen={this.state.fullscreen}
          fullscreenToggle={this.toggleFullScreen.bind(this)}
          />
        <Split flex='right' className={styles.framebody}>
          {(this.props.sidebar) ? this.props.sidebar() : null}
          <Section className={styles.contents + ' frame-contents'}>
            {this.props.contents}
          </Section>
        </Split>
      </Article>
    )
  }
}

export default FrameTemplate

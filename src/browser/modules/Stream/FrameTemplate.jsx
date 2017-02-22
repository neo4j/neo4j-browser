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
      fullscreen: false,
      collapse: false
    }
  }
  toggleFullScreen () {
    this.setState({fullscreen: !this.state.fullscreen})
  }
  toggleCollapse () {
    this.setState({collapse: !this.state.collapse})
  }
  render () {
    const fullscreenClass = (this.state.fullscreen) ? styles.fullscreen : ''
    const collapseClass = (this.state.collapse) ? styles.collapse : ''
    return (
      <Article className={styles.frame + ' ' + fullscreenClass}>
        <FrameTitlebar
          frame={this.props.header}
          fullscreen={this.state.fullscreen}
          fullscreenToggle={this.toggleFullScreen.bind(this)}
          collapse={this.state.collapse}
          collapseToggle={this.toggleCollapse.bind(this)}
          />
        <Split flex='right' className={styles.framebody + ' ' + collapseClass}>
          {(this.props.sidebar) ? this.props.sidebar() : null}
          <Section className={styles.contents + ' frame-contents'}>
            {this.props.contents}
          </Section>
        </Split>
        {this.props.children}
      </Article>
    )
  }
}

export default FrameTemplate

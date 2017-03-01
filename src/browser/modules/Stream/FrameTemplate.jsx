import React from 'react'
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
      <article className={styles.frame + ' ' + fullscreenClass}>
        <FrameTitlebar
          frame={this.props.header}
          fullscreen={this.state.fullscreen}
          fullscreenToggle={this.toggleFullScreen.bind(this)}
          />
        <div className={styles.framebody}>
          {(this.props.sidebar) ? this.props.sidebar() : null}
          <div className={styles.contents + ' frame-contents'}>
            {this.props.contents}
          </div>
        </div>
        {this.props.children}
      </article>
    )
  }
}

export default FrameTemplate

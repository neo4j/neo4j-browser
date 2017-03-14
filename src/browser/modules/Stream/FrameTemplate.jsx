import { Component } from 'preact'
import FrameTitlebar from './FrameTitlebar'
import Visible from 'browser-components/Visible'
import { StyledFrame, StyledFullscreenFrame, StyledFrameBody, StyledFrameContents, StyledFrameStatusbar, StyledFrameMainSection } from './styled'

class FrameTemplate extends Component {
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
    const FrameComponent = this.state.fullscreen ? StyledFullscreenFrame : StyledFrame
    return (
      <FrameComponent>
        <FrameTitlebar
          frame={this.props.header}
          fullscreen={this.state.fullscreen}
          fullscreenToggle={this.toggleFullScreen.bind(this)}
          collapse={this.state.collapse}
          collapseToggle={this.toggleCollapse.bind(this)}
          />
        <StyledFrameBody fullscreen={this.state.fullscreen} collapsed={this.state.collapse}>
          {(this.props.sidebar) ? this.props.sidebar() : null}
          <StyledFrameMainSection>
            <StyledFrameContents fullscreen={this.state.fullscreen}>
              {this.props.contents}
            </StyledFrameContents>
            <Visible if={this.props.statusbar}>
              <StyledFrameStatusbar>{this.props.statusbar}</StyledFrameStatusbar>
            </Visible>
          </StyledFrameMainSection>
        </StyledFrameBody>
      </FrameComponent>
    )
  }
}

export default FrameTemplate

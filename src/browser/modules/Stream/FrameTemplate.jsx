/*
 * Copyright (c) 2002-2017 "Neo Technology,"
 * Network Engine for Objects in Lund AB [http://neotechnology.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Component } from 'preact'
import FrameTitlebar from './FrameTitlebar'
import Visible from 'browser-components/Visible'
import { StyledFrame, StyledFrameBody, StyledFrameContents, StyledFrameStatusbar, StyledFrameMainSection } from './styled'

class FrameTemplate extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fullscreen: false,
      collapse: false,
      pinned: false
    }
  }
  toggleFullScreen () {
    this.setState({fullscreen: !this.state.fullscreen}, () => this.props.onResize && this.props.onResize(this.state.fullscreen, this.state.collapse, this.lastHeight))
  }
  toggleCollapse () {
    this.setState({collapse: !this.state.collapse}, () => this.props.onResize && this.props.onResize(this.state.fullscreen, this.state.collapse, this.lastHeight))
  }
  togglePin () {
    this.setState({pinned: !this.state.pinned}, () => this.props.onResize && this.props.onResize(this.state.fullscreen, this.state.collapse, this.lastHeight))
  }
  componentDidUpdate () {
    if (this.frameContentElement && this.lastHeight !== this.frameContentElement.base.clientHeight) {
      this.lastHeight = this.frameContentElement.base.clientHeight
      this.props.onResize && this.props.onResize(this.state.fullscreen, this.state.collapse, this.lastHeight)
    }
  }
  setFrameContentElement (el) {
    this.frameContentElement = el
  }
  render () {
    return (
      <StyledFrame fullscreen={this.state.fullscreen}>
        <FrameTitlebar
          frame={this.props.header}
          fullscreen={this.state.fullscreen}
          fullscreenToggle={this.toggleFullScreen.bind(this)}
          collapse={this.state.collapse}
          collapseToggle={this.toggleCollapse.bind(this)}
          pinned={this.state.pinned}
          togglePin={this.togglePin.bind(this)}
          exportData={this.props.exportData}
          />
        <StyledFrameBody fullscreen={this.state.fullscreen} collapsed={this.state.collapse}>
          {(this.props.sidebar) ? this.props.sidebar() : null}
          <StyledFrameMainSection>
            <StyledFrameContents fullscreen={this.state.fullscreen} ref={this.setFrameContentElement.bind(this)}>
              {this.props.contents}
            </StyledFrameContents>
            <Visible if={this.props.statusbar}>
              <StyledFrameStatusbar fullscreen={this.state.fullscreen}>{this.props.statusbar}</StyledFrameStatusbar>
            </Visible>
          </StyledFrameMainSection>
        </StyledFrameBody>
      </StyledFrame>
    )
  }
}

export default FrameTemplate

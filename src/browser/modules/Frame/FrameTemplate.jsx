/*
 * Copyright (c) 2002-2020 "Neo4j,"
 * Neo4j Sweden AB [http://neo4j.com]
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

import React, { Component } from 'react'
import FrameTitlebar from './FrameTitlebar'
import Render from 'browser-components/Render'
import {
  StyledFrame,
  StyledFrameBody,
  StyledFrameContents,
  StyledFrameStatusbar,
  StyledFrameMainSection,
  StyledFrameAside
} from './styled'

class FrameTemplate extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fullscreen: false,
      collapse: false,
      pinned: false,
      lastHeight: 10
    }
  }

  toggleFullScreen() {
    this.setState(
      { fullscreen: !this.state.fullscreen },
      () =>
        this.props.onResize &&
        this.props.onResize(
          this.state.fullscreen,
          this.state.collapse,
          this.frameContentElement.clientHeight
        )
    )
  }

  toggleCollapse() {
    this.setState(
      { collapse: !this.state.collapse },
      () =>
        this.props.onResize &&
        this.props.onResize(
          this.state.fullscreen,
          this.state.collapse,
          this.state.lastHeight
        )
    )
  }

  togglePin() {
    this.setState(
      { pinned: !this.state.pinned },
      () =>
        this.props.onResize &&
        this.props.onResize(
          this.state.fullscreen,
          this.state.collapse,
          this.state.lastHeight
        )
    )
  }

  componentDidUpdate() {
    if (this.frameContentElement.clientHeight < 300) return // No need to report a transition
    if (
      this.frameContentElement &&
      this.state.lastHeight !== this.frameContentElement.clientHeight
    ) {
      this.props.onResize &&
        this.props.onResize(
          this.state.fullscreen,
          this.state.collapse,
          this.frameContentElement.clientHeight
        )
      this.setState({ lastHeight: this.frameContentElement.clientHeight })
    }
  }

  setFrameContentElement = el => {
    this.frameContentElement = el
  }

  render() {
    const { className } = this.props
    const classNames = []
    if (className) {
      classNames.push(className)
    }
    if (this.state.fullscreen) {
      classNames.push('is-fullscreen')
    }
    return (
      <StyledFrame
        className={classNames.join(' ')}
        data-testid="frame"
        fullscreen={this.state.fullscreen}
      >
        {this.props.header && (
          <FrameTitlebar
            frame={this.props.header}
            fullscreen={this.state.fullscreen}
            fullscreenToggle={this.toggleFullScreen.bind(this)}
            collapse={this.state.collapse}
            collapseToggle={this.toggleCollapse.bind(this)}
            pinned={this.state.pinned}
            togglePin={this.togglePin.bind(this)}
            numRecords={this.props.numRecords || 0}
            getRecords={this.props.getRecords}
            visElement={this.props.visElement}
          />
        )}
        <StyledFrameBody
          fullscreen={this.state.fullscreen}
          collapsed={this.state.collapse}
        >
          {this.props.sidebar ? this.props.sidebar() : null}
          {this.props.aside && (
            <StyledFrameAside>{this.props.aside}</StyledFrameAside>
          )}
          <StyledFrameMainSection>
            <StyledFrameContents
              fullscreen={this.state.fullscreen}
              ref={this.setFrameContentElement}
              data-testid="frameContents"
            >
              {this.props.contents}
            </StyledFrameContents>
          </StyledFrameMainSection>
        </StyledFrameBody>
        <Render if={this.props.statusbar}>
          <StyledFrameStatusbar
            fullscreen={this.state.fullscreen}
            data-testid="frameStatusbar"
          >
            {this.props.statusbar}
          </StyledFrameStatusbar>
        </Render>
      </StyledFrame>
    )
  }
}

export default FrameTemplate

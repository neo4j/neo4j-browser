/*
 * Copyright (c) 2002-2019 "Neo4j,"
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
import { withBus } from 'react-suber'
import { fetchGuideFromWhitelistAction } from 'shared/modules/commands/commandsDuck'

import Docs from '../Docs/Docs'
import docs from '../../documentation'
import FrameTemplate from '../Frame/FrameTemplate'
import FrameAside from '../Frame/FrameAside'
import {
  splitStringOnFirst,
  transformCommandToHelpTopic
} from 'services/commandUtils'
import { ErrorsView } from './CypherFrame/ErrorsView'

const {
  play: { chapters }
} = docs

const checkHtmlForSlides = html => {
  const el = document.createElement('html')
  el.innerHTML = html
  const slides = el.getElementsByTagName('slide')
  return !!slides.length
}

export class PlayFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      guide: null,
      aside: null,
      hasCarousel: false,
      isRemote: false
    }
  }

  componentDidMount () {
    if (this.props.frame.result) {
      // Found remote guide
      this.setState({
        guide: <Docs withDirectives html={this.props.frame.result} />,
        hasCarousel: checkHtmlForSlides(this.props.frame.result),
        isRemote: true
      })
      return
    }
    if (
      this.props.frame.response &&
      this.props.frame.error &&
      this.props.frame.error.error
    ) {
      // Not found remotely (or other error)
      if (this.props.frame.response.status === 404) {
        return this.unfound(chapters['unfound'])
      }
      return this.setState({
        guide: (
          <ErrorsView
            result={{
              message:
                'Error: The remote server responded with the following error: ' +
                this.props.frame.response.status,
              code: 'Remote guide error'
            }}
          />
        )
      })
    }
    if (this.props.frame.error && this.props.frame.error.error) {
      // Some other error. Whitelist error etc.
      return this.setState({
        guide: (
          <ErrorsView
            result={{
              message: this.props.frame.error.error,
              code: 'Remote guide error'
            }}
          />
        )
      })
    }

    const guideName = transformCommandToHelpTopic(
      this.props.frame.cmd || 'start'
    )
    const guide = chapters[guideName] || {}

    // Check if content exists
    if (Object.keys(guide).length) {
      const { content, title, subtitle } = guide
      const hasCarousel = !!content.props.slides
      this.setState({
        guide: (
          <Docs
            withDirectives
            hasCarouselComponent={hasCarousel}
            content={content}
          />
        ),
        aside:
          title && !hasCarousel ? (
            <FrameAside title={title} subtitle={subtitle} />
          ) : null,
        hasCarousel
      })
      return
    }

    // Not found remotely or locally
    // Try to find it remotely by name
    if (this.props.bus) {
      const topicInput = (
        splitStringOnFirst(this.props.frame.cmd, ' ')[1] || ''
      ).trim()
      const action = fetchGuideFromWhitelistAction(topicInput)
      this.props.bus.self(action.type, action, res => {
        if (!res.success) {
          // No luck
          return this.unfound(chapters['unfound'])
        }
        // Found remote guide
        this.setState({
          guide: <Docs withDirectives html={res.result} />,
          hasCarousel: checkHtmlForSlides(res.result)
        })
      })
    } else {
      // No bus. Give up
      return this.unfound(chapters['unfound'])
    }
  }

  unfound ({ content, title, subtitle }) {
    this.setState({
      guide: <Docs withDirectives content={content} />,
      aside: <FrameAside title={title} subtitle={subtitle} />
    })
  }

  render () {
    const classNames = ['playFrame']
    if (this.state.hasCarousel) {
      classNames.push('has-carousel')
    }
    if (this.state.isRemote) {
      classNames.push('is-remote')
    }

    return (
      <FrameTemplate
        className={classNames.join(' ')}
        header={this.props.frame}
        aside={this.state.aside}
        contents={this.state.guide}
      />
    )
  }
}

export default withBus(PlayFrame)

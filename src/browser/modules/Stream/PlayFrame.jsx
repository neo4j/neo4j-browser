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
import { splitStringOnFirst } from 'services/commandUtils'
import { ErrorsView } from './CypherFrame/ErrorsView'

const { guides } = docs

export class PlayFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      guide: null,
      aside: null,
      hasCarousel: false
    }
  }

  componentDidMount () {
    if (this.props.frame.result) {
      // Found remote guide
      const el = document.createElement('html')
      el.innerHTML = this.props.frame.result
      const slides = el.getElementsByTagName('slide')
      this.setState({
        guide: <Docs withDirectives html={this.props.frame.result} />,
        hasCarousel: !!slides.length
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
        return this.unfound(guides['unfound'])
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
    const topicInput = (
      splitStringOnFirst(this.props.frame.cmd, ' ')[1] || 'start'
    ).trim()
    const guideName = topicInput.toLowerCase().replace(/\s|-/g, '')
    const guide = guides[guideName] || {}

    // Check if content exists
    if (Object.keys(guide).length) {
      const { content, title, subtitle } = guide
      this.setState({
        guide: <Docs withDirectives content={content} />,
        aside: title ? <FrameAside title={title} subtitle={subtitle} /> : null,
        hasCarousel: !!content.props.slides
      })
      return
    }

    // Not found remotely or locally
    // Try to find it remotely by name
    if (this.props.bus) {
      const action = fetchGuideFromWhitelistAction(topicInput)
      this.props.bus.self(action.type, action, res => {
        if (!res.success) {
          // No luck
          return this.unfound(guides['unfound'])
        }
        this.setState({ guide: <Docs withDirectives html={res.result} /> })
      })
    } else {
      // No bus. Give up
      return this.unfound(guides['unfound'])
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

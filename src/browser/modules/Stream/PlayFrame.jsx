/*
 * Copyright (c) 2002-2019 "Neo4j, Inc"
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

import React, { Component } from 'react'
import { withBus } from 'react-suber'
import { fetchGuideFromWhitelistAction } from 'shared/modules/commands/commandsDuck'

import Guides from '../Guides/Guides'
import * as html from '../Guides/html'
import FrameTemplate from './FrameTemplate'
import { splitStringOnFirst } from 'services/commandUtils'
import { ErrorsView } from './CypherFrame/ErrorsView'

export class PlayFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      guide: null
    }
  }
  componentDidMount () {
    if (this.props.frame.result) {
      // Found remote guide
      this.setState({
        guide: <Guides withDirectives html={this.props.frame.result} />
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
        return this.setState({
          guide: <Guides withDirectives html={html['unfound']} />
        })
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
    if (html[guideName] !== undefined) {
      // Found it locally
      this.setState({ guide: <Guides withDirectives html={html[guideName]} /> })
      return
    }
    // Not found remotely or locally
    // Try to find it remotely by name
    if (this.props.bus) {
      const action = fetchGuideFromWhitelistAction(topicInput)
      this.props.bus.self(action.type, action, res => {
        if (!res.success) {
          // No luck
          return this.setState({
            guide: <Guides withDirectives html={html['unfound']} />
          })
        }
        this.setState({ guide: <Guides withDirectives html={res.result} /> })
      })
    } else {
      // No bus. Give up
      return this.setState({
        guide: <Guides withDirectives html={html['unfound']} />
      })
    }
  }
  render () {
    return (
      <FrameTemplate
        className='playFrame'
        header={this.props.frame}
        contents={this.state.guide}
      />
    )
  }
}

export default withBus(PlayFrame)

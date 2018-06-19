/*
 * Copyright (c) 2002-2018 "Neo4j, Inc"
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

import ConnectionForm from './ConnectionForm'
import FrameTemplate from '../FrameTemplate'
import FrameError from '../FrameError'
import Render from 'browser-components/Render'
import { H3 } from 'browser-components/headers'
import { Lead } from 'browser-components/Text'
import { StyledConnectionFrame, StyledConnectionAside } from './styled'

export class ChangePasswordFrame extends Component {
  constructor (props) {
    super(props)
    const connection = this.props.frame.connectionData
    this.state = {
      ...connection,
      passwordChangeNeeded: false,
      error: {},
      success: false
    }
  }
  error = e => {
    if (e.code === 'N/A') {
      e.message = 'Existing password is incorrect'
    }
    this.setState({ error: e })
  }
  onSuccess = () => {
    this.setState({ password: '' })
    this.setState({ success: true })
  }
  render () {
    const content = (
      <StyledConnectionFrame>
        <StyledConnectionAside>
          <H3>Password change</H3>
          <Render if={!this.state.success}>
            <Lead>
              Enter your current password and the new twice to change your
              password.
            </Lead>
          </Render>
          <Render if={this.state.success}>
            <Lead>Password change successful</Lead>
          </Render>
        </StyledConnectionAside>

        <ConnectionForm
          {...this.props}
          error={this.error}
          onSuccess={this.onSuccess}
          forcePasswordChange
          showExistingPasswordInput
        />
      </StyledConnectionFrame>
    )
    return (
      <FrameTemplate
        header={this.props.frame}
        statusbar={
          <FrameError
            code={this.state.error.code}
            message={this.state.error.message}
          />
        }
        contents={content}
      />
    )
  }
}
export default ChangePasswordFrame

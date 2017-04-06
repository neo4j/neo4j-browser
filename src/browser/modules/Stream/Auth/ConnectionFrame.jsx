/*
 * Copyright (c) 2002-2016 "Neo Technology,"
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

import FrameTemplate from '../FrameTemplate'
import ConnectionForm from './ConnectionForm'
import FrameError from '../FrameError'
import {H3} from 'browser-components/headers'
import {
  StyledConnectionFrame,
  StyledConnectionAside
} from './styled'

export class ConnectionFrame extends Component {
  constructor (props) {
    super(props)
    this.state = {
      error: {}
    }
  }
  error (e) {
    this.setState({error: e})
  }
  render () {
    return (
      <FrameTemplate
        header={this.props.frame}
        statusbar={<FrameError code={this.state.error.code} message={this.state.error.message} />}
        contents={
          <StyledConnectionFrame>
            <StyledConnectionAside>
              <H3>Connect to Neo4j</H3>
                Database access requires an authenticated connection.
            </StyledConnectionAside>
            <ConnectionForm {...this.props} error={this.error.bind(this)} />
          </StyledConnectionFrame>
          }
      />
    )
  }
}

export default ConnectionFrame

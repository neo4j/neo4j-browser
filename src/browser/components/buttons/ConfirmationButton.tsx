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
import styled from 'styled-components'
import {
  MinusIcon,
  RightArrowIcon,
  CancelIcon
} from 'browser-components/icons/Icons'

const IconButton = styled.button`
  margin-left: 4px;
  border: 0;
  background: transparent;
  &:focus {
    outline: none;
  }
`

export class ConfirmationButton extends Component {
  constructor(props) {
    super(props)

    this.state = {
      requested: false
    }

    this.confirmIcon = this.props.confirmIcon || <RightArrowIcon />
    this.cancelIcon = this.props.cancelIcon || <CancelIcon />
    this.requestIcon = this.props.requestIcon || <MinusIcon />
  }

  render() {
    if (this.state.requested) {
      return (
        <span>
          <IconButton
            data-testid="confirmation-button-confirm"
            onClick={() => {
              this.setState({ requested: false })
              this.props.onConfirmed()
            }}
          >
            {this.confirmIcon}
          </IconButton>
          <IconButton
            data-testid="confirmation-button-cancel"
            onClick={() => this.setState({ requested: false })}
          >
            {this.cancelIcon}
          </IconButton>
        </span>
      )
    } else {
      return (
        <IconButton
          data-testid="confirmation-button-initial"
          onClick={() => this.setState({ requested: true })}
        >
          {this.requestIcon}
        </IconButton>
      )
    }
  }
}

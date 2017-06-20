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
import styles from './style.css'
import {
  MinusIcon,
  RightArrowIcon,
  CancelIcon
} from 'browser-components/icons/Icons'

export class ConfirmationButton extends Component {
  constructor (props) {
    super(props)

    this.state = {
      requested: false
    }
  }

  componentWillMount () {
    this.confirmIcon = this.props.confirmIcon || <RightArrowIcon />
    this.cancelIcon = this.props.cancelIcon || <CancelIcon />
    this.requestIcon = this.props.requestIcon || <MinusIcon />
  }

  render () {
    if (this.state.requested) {
      return (
        <div>
          <button
            className={styles.icon}
            onClick={() => {
              this.setState({ requested: false })
              this.props.onConfirmed()
            }}
          >
            {this.confirmIcon}
          </button>
          <button
            className={styles.icon}
            onClick={() => this.setState({ requested: false })}
          >
            {this.cancelIcon}
          </button>
        </div>
      )
    } else {
      return (
        <button
          className={styles.icon}
          onClick={() => this.setState({ requested: true })}
        >
          {this.requestIcon}
        </button>
      )
    }
  }
}

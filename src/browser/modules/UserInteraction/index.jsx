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
import { withBus } from 'preact-suber'
import { throttle } from 'services/utils'
import { USER_INTERACTION } from 'shared/modules/userInteraction/userInteractionDuck'

const reportInteraction = (bus) => {
  if (!bus) return
  bus.send(USER_INTERACTION)
}
const throttledReportInteraction = throttle(reportInteraction, 5000)

export class UserInteraction extends Component {
  componentDidMount () {
    document.addEventListener('keyup', () => throttledReportInteraction(this.props.bus))
    document.addEventListener('click', () => throttledReportInteraction(this.props.bus))
  }
  componentWillUnmount () {
    document.removeEventListener('keyup', () => throttledReportInteraction(this.props.bus))
    document.removeEventListener('click', () => throttledReportInteraction(this.props.bus))
  }
}

export default withBus(UserInteraction)

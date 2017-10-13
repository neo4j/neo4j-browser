/*
 * Copyright (c) 2002-2017 "Neo4j, Inc,"
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
import { getActiveGraph, getCredentials, eventToHandler } from './helpers'

export default class DesktopIntegration extends Component {
  state = {
    listenerSetup: false,
    cachedConnectionCredentials: {}
  }
  setupListener = props => {
    if (this.state.listenerSetup) return
    const { integrationPoint } = props
    // Run on context updates
    if (integrationPoint && integrationPoint.onContextUpdate) {
      const listenerSetup = () =>
        integrationPoint.onContextUpdate((event, newContext, oldContext) => {
          const handlerPropName = eventToHandler(event.type)
          if (!handlerPropName) return
          if (typeof this.props[handlerPropName] === 'undefined') return
          this.props[handlerPropName](event, newContext, oldContext)
        })
      this.setState({ listenerSetup: true }, listenerSetup)
    }
  }
  checkContextForActiveConnection = props => {
    const { integrationPoint } = props
    if (integrationPoint && integrationPoint.getContext) {
      integrationPoint
        .getContext()
        .then(context => {
          const activeGraph = getActiveGraph(context)
          if (this.props.onMount) {
            const connectionCredentials = getCredentials(
              'bolt',
              activeGraph.connection
            )
            this.props.onMount(activeGraph, connectionCredentials, context)
          }
        })
        .catch(e => {}) // Catch but don't bother
    }
  }
  componentDidMount () {
    this.checkContextForActiveConnection(this.props)
    this.setupListener(this.props)
  }
  componentWillReceiveProps (props) {
    this.setupListener(props)
  }
  render = () => {
    return null
  }
}

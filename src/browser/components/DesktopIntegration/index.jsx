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

import { Component } from 'react'
import { getActiveGraph, getCredentials, eventToHandler } from './helpers'

export default class DesktopIntegration extends Component {
  setupListener () {
    const { integrationPoint, onArgumentsChange = null } = this.props
    if (integrationPoint && integrationPoint.onContextUpdate) {
      const getKerberosTicket =
        integrationPoint.getKerberosTicket || function () {}
      integrationPoint.onContextUpdate((event, newContext, oldContext) => {
        const handlerPropName = eventToHandler(event.type)
        if (!handlerPropName) return
        if (typeof this.props[handlerPropName] === 'undefined') return
        this.props[handlerPropName](
          event,
          newContext,
          oldContext,
          getKerberosTicket
        )
      })
    }
    if (
      integrationPoint &&
      integrationPoint.onArgumentsChange &&
      onArgumentsChange
    ) {
      integrationPoint.onArgumentsChange(onArgumentsChange)
    }
  }
  loadInitialContext () {
    const { integrationPoint, onMount = null } = this.props
    if (integrationPoint && integrationPoint.getContext) {
      const getKerberosTicket =
        integrationPoint.getKerberosTicket || function () {}
      integrationPoint
        .getContext()
        .then(context => {
          const activeGraph = getActiveGraph(context) || {}
          if (onMount) {
            const connectionCredentials = getCredentials(
              'bolt',
              activeGraph.connection || null
            )
            onMount(
              activeGraph,
              connectionCredentials,
              context,
              getKerberosTicket
            )
          }
        })
        .catch(e => {}) // Catch but don't bother
    }
  }
  componentDidMount () {
    this.loadInitialContext()
    this.setupListener()
  }
  render () {
    return null
  }
}

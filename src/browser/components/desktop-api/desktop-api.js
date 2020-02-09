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
import { useEffect } from 'react'
import { eventToHandler } from './desktop-api.utils'

const DEFAULT_INTEGRATION_POINT = window.neo4jDesktopApi

function DesktopApi({ integrationPoint = DEFAULT_INTEGRATION_POINT, ...rest }) {
  const getKerberosTicket =
    (integrationPoint && integrationPoint.getKerberosTicket) || undefined

  useEffect(() => {
    async function mountEvent() {
      if (integrationPoint && integrationPoint.getContext) {
        // Pull initial data and call handler if defined
        if (rest.onMount) {
          const context = await integrationPoint.getContext()
          rest.onMount('MOUNT', context, {}, getKerberosTicket)
        }
      }
    }

    function onUpdate() {
      // Arguments change
      if (
        integrationPoint &&
        integrationPoint.onArgumentsChange &&
        rest.onArgumentsChange
      ) {
        integrationPoint.onArgumentsChange(rest.onArgumentsChange)
      }
      // Regular events
      if (integrationPoint && integrationPoint.onContextUpdate) {
        // Setup generic event listener
        integrationPoint.onContextUpdate((event, context, oldContext) => {
          const handlerName = eventToHandler(event.type)
          // If we have a prop that's interested in this event, call it
          if (handlerName && typeof rest[handlerName] !== 'undefined') {
            rest[handlerName](event, context, oldContext, getKerberosTicket)
          }
        })
      }
    }

    mountEvent()
    onUpdate()

    return () => {
      integrationPoint &&
        integrationPoint.onContextUpdate &&
        integrationPoint.onContextUpdate(null)
      integrationPoint &&
        integrationPoint.onArgumentsChange &&
        integrationPoint.onArgumentsChange(null)
    }
  }, [integrationPoint])
  return null
}

export default DesktopApi

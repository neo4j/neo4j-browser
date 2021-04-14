/*
 * Copyright (c) "Neo4j"
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
import { connect } from 'react-redux'
import { canUseDOM } from 'services/utils'
import { updateData } from 'shared/modules/udc/udcDuck'

export class Segment extends Component<any> {
  componentDidMount() {
    const {
      segmentKey,
      setTrackCallback,
      updateData,
      children, // eslint-disable-line
      ...otherProps
    } = this.props
    if (!segmentKey || !canUseDOM()) {
      return
    }
    if (!(window as any).analytics) {
      ;(function(window: any, document: Document, segmentKey: string, a?: any) {
        const analytics = (window.analytics = window.analytics || [])
        if (!analytics.initialize) {
          if (analytics.invoked) {
            window.console &&
              console.error &&
              console.error('Segment snippet included twice.')
          } else {
            analytics.invoked = !0
            analytics.methods = [
              'trackSubmit',
              'trackClick',
              'trackLink',
              'trackForm',
              'pageview',
              'identify',
              'reset',
              'group',
              'track',
              'ready',
              'alias',
              'debug',
              'page',
              'once',
              'off',
              'on',
              'addSourceMiddleware',
              'addIntegrationMiddleware',
              'setAnonymousId',
              'addDestinationMiddleware'
            ]
            analytics.factory = function(t: any) {
              return function() {
                const e = Array.prototype.slice.call(arguments)
                e.unshift(t)
                analytics.push(e)
                return analytics
              }
            }
            for (let t = 0; t < analytics.methods.length; t++) {
              const e = analytics.methods[t]
              analytics[e] = analytics.factory(e)
            }
            analytics.load = function(t: any, e: any) {
              const n = document.createElement('script')
              n.type = 'text/javascript'
              n.async = !0
              n.src =
                'https://cdn.segment.com/analytics.js/v1/' +
                t +
                '/analytics.min.js'
              a = document.getElementsByTagName('script')[0]
              a.parentNode.insertBefore(n, a)
              analytics._loadOptions = e
            }
            analytics._writeKey = segmentKey
            analytics.SNIPPET_VERSION = '4.13.2'
            analytics.load(segmentKey)
            const doTrack = (...args: any) => {
              window.analytics.track(...args)
            }
            setTrackCallback(doTrack)
          }
        }
      })(window, document, segmentKey)
    }
    updateData({ ...otherProps, segmentKey: segmentKey })
  }

  componentDidUpdate() {
    const {
      segmentKey,
      updateData,
      children, // eslint-disable-line
      ...otherProps
    } = this.props
    if (!canUseDOM()) return
    updateData({ ...otherProps, segmentKey: segmentKey })
  }

  shouldComponentUpdate() {
    return false
  }

  // @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
  componentWillUnmount() {
    const { setTrackCallback } = this.props
    setTrackCallback(null)
    if (!canUseDOM()) return false
    delete (window as any).analytics
  }

  render() {
    return null
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateData: (data: any) => dispatch(updateData(data))
  }
}
export default connect<any, any, any, any>(null, mapDispatchToProps)(Segment)

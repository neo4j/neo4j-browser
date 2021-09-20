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
import { updateUdcData } from 'shared/modules/udc/udcDuck'

export class Intercom extends Component<any> {
  componentDidMount() {
    const {
      appID,
      updateData,
      children, // eslint-disable-line
      ...otherProps
    } = this.props
    if (!appID || !canUseDOM()) {
      return
    }
    if (!(window as any).Intercom) {
      ;(function(w: any, d: Document, id: string, s?: any, x?: any) {
        function i() {
          i.c(arguments)
        }
        i.q = [] as any[]
        i.c = function(args: any) {
          i.q.push(args)
        }
        w.Intercom = i
        s = d.createElement('script')
        s.async = 1
        s.src = 'https://widget.intercom.io/widget/' + id
        x = d.getElementsByTagName('script')[0]
        x.parentNode.insertBefore(s, x)
      })(window, document, appID)
    }
    updateData({ ...otherProps, app_id: appID })
  }

  componentDidUpdate() {
    const {
      appID,
      updateData,
      children, // eslint-disable-line
      ...otherProps
    } = this.props
    if (!canUseDOM()) return
    updateData({ ...otherProps, app_id: appID })
  }

  shouldComponentUpdate() {
    return false
  }

  componentWillUnmount() {
    if (canUseDOM()) {
      ;(window as any).Intercom('shutdown')
      delete (window as any).Intercom
    }
  }

  render() {
    return null
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    updateData: (data: any) => dispatch(updateUdcData(data))
  }
}
export default connect<any, any, any, any>(null, mapDispatchToProps)(Intercom)

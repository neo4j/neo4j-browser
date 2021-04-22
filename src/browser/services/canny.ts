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

import { Component, ReactNode } from 'react'
import { canUseDOM } from 'services/utils'

export const cannyOptions = {
  appID: '601d00fb7a41e3035f75e1e8',
  position: 'right',
  align: 'top'
}
export const CANNY_FEATURE_REQUEST_URL =
  'https://neo4j-browser.canny.io/feature-requests'

declare global {
  interface Window {
    Canny?: { (command: string, options?: unknown): void }
    CannyIsLoaded?: boolean
    attachEvent?: typeof window.addEventListener
  }
}

const CannySDK = {
  init: (): Promise<Event> =>
    new Promise(function(resolve, reject) {
      // Code obtained from Canny.io; See: https://developers.canny.io/install

      if (typeof window.Canny === 'function') {
        return
      }

      const canny = function(...args: unknown[]) {
        canny.q.push(args)
      }
      canny.q = [] as unknown[]
      window.Canny = canny

      function loadCanny() {
        if (document.getElementById('canny-jssdk')) {
          return
        }
        const f = document.getElementsByTagName('script')[0]
        const e = document.createElement('script')
        e.type = 'text/javascript'
        e.async = true
        e.src = 'https://canny.io/sdk.js'
        e.onerror = reject
        e.onload = resolve
        e.addEventListener('error', reject)
        e.addEventListener('load', resolve)
        f?.parentNode?.insertBefore(e, f)
      }

      if (document.readyState === 'complete') {
        loadCanny()
      } else if (window.attachEvent) {
        window.attachEvent('onload', loadCanny)
      } else {
        window.addEventListener('load', loadCanny, false)
      }
    })
}

export class CannyLoader extends Component {
  componentDidMount(): void {
    CannySDK.init()
      .then(() => {
        window.CannyIsLoaded = true
      })
      .catch(() => {
        window.CannyIsLoaded = false
      })
  }

  shouldComponentUpdate(): boolean {
    return false
  }

  componentWillUnmount(): void {
    if (canUseDOM()) {
      delete (window as any).CannyIsLoaded
      delete (window as any).Canny
      const cannyTag = document.getElementById('canny-jssdk')
      if (cannyTag?.outerHTML) {
        cannyTag.outerHTML = ''
      }
    }
  }

  render(): ReactNode {
    return null
  }
}

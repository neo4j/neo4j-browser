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
  appID: '5eb66d2ff9f4665cc1bed233',
  position: 'right',
  align: 'top',
  labelIDs: ['6239a0c787c34c6baebda0fd']
}
export const CANNY_FEATURE_REQUEST_URL = 'https://feedback.neo4j.com/browser'

export interface CannyOptions {
  appID: string
  position: string
  align: string
}
declare global {
  interface Window {
    Canny?: { (command: string, options?: CannyOptions): void }
    IsCannyLoaded?: boolean
    attachEvent?: typeof window.addEventListener
  }
}

const CannySDK = {
  init: (): Promise<Event> =>
    new Promise(function (resolve, reject) {
      // Code obtained from Canny.io; See: https://developers.canny.io/install

      if (typeof window.Canny === 'function') {
        return
      }

      const canny = function (...args: [string, CannyOptions?]) {
        canny.q.push(args)
      }

      canny.q = [] as [string, CannyOptions?][]
      window.Canny = canny

      function loadCanny() {
        if (document.getElementById('canny-jssdk')) {
          return
        }
        const firstScriptElement = document.getElementsByTagName('script')[0]
        const scriptElement = document.createElement('script')
        scriptElement.type = 'text/javascript'
        scriptElement.async = true
        scriptElement.src = 'https://canny.io/sdk.js'
        scriptElement.onerror = reject
        scriptElement.onload = resolve
        scriptElement.addEventListener('error', reject)
        scriptElement.addEventListener('load', resolve)
        firstScriptElement?.parentNode?.insertBefore(
          scriptElement,
          firstScriptElement
        )
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
        window.IsCannyLoaded = true
        window.Canny && window.Canny('initChangelog', cannyOptions)
      })
      .catch(() => {
        window.IsCannyLoaded = false
      })
  }

  shouldComponentUpdate(): boolean {
    return false
  }

  componentWillUnmount(): void {
    if (canUseDOM()) {
      window.Canny && window.Canny('closeChangelog')

      delete window.IsCannyLoaded
      delete window.Canny
    }
  }

  render(): ReactNode {
    return null
  }
}

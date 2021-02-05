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

export const BrowserSyncAuthIframe = (
  silentAuthUrl: any,
  delegationTokenUrl: any,
  callback: any
) => {
  setupIframe(silentAuthUrl, 'auth0:silent-authentication', (data: any) => {
    setupIframe(
      `${delegationTokenUrl}${data.hash}`,
      'auth0:delegation-token',
      ({ userData }: any) => callback(userData)
    )
  })
}

export const BrowserSyncSignoutIframe = (logoutUrl: any, callback = () => {}) =>
  setupIframe(logoutUrl, undefined, callback)

function setupIframe(url: any, type: any, cb: any) {
  const iframe: any = document.createElement('iframe')
  iframe.style.display = 'none'
  iframe.src = url
  if (!type) {
    // If no type, don't setup a listener and remove iframe onload
    iframe.onload = () => iframe.parentElement.removeChild(iframe)
    document.body.appendChild(iframe)
    return cb()
  }
  document.body.appendChild(iframe)
  const pollInterval = setInterval(() => {
    iframe.contentWindow.postMessage(`Polling ${url} for results`, url)
  }, 3000)
  const listener = (event: any) => {
    if (url.indexOf(event.origin) !== 0) return
    if (!event.data || event.data.type !== type) return
    clearInterval(pollInterval)
    window.removeEventListener('message', listener)
    iframe.parentElement.removeChild(iframe)
    cb(event.data)
  }
  window.addEventListener('message', listener, false)
}

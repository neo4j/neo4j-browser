/*
 * Copyright (c) 2002-2020 "Neo4j,"
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

const BrowserSyncAuthWindow = (url, callback) => {
  const win = window.open(
    url,
    'loginWindow',
    'location=0,status=0,scrollbars=0, width=1080,height=720'
  )
  const pollInterval = setInterval(() => {
    win.postMessage('Polling for results', url)
  }, 6000)
  try {
    win.moveTo(500, 300)
  } catch (e) {
    callback(null, e)
  }
  const listener = event => {
    if (url.indexOf(event.origin) !== 0) return
    clearInterval(pollInterval)
    window.removeEventListener('message', listener)
    callback(event.data)
    win.close()
  }
  window.addEventListener('message', listener, false)
}

export default BrowserSyncAuthWindow

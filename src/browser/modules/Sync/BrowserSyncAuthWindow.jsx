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
  window.addEventListener(
    'message',
    event => {
      clearInterval(pollInterval)
      callback(event.data)
      win.close()
    },
    false
  )
}

export default BrowserSyncAuthWindow

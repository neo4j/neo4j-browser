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
import d3 from 'd3'

// euclidean distance
const dist = (a: [number, number], b: [number, number]) =>
  Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))

/* This click handler is to prevent clicks meant to 
drag a node, from triggering onclick events 
*/
export default function clickHandler() {
  const cc = function (selection: any) {
    let down: [number, number] | undefined
    const tolerance = 5
    let wait: number | null = null

    selection.on('mousedown', () => {
      ;((d3.event as Event).target as any).__data__.fixed = true
      down = d3.mouse(document.body)
      return (d3.event as Event).stopPropagation()
    })

    return selection.on('mouseup', () => {
      if (down && dist(down, d3.mouse(document.body)) > tolerance) {
      } else {
        if (wait) {
          window.clearTimeout(wait)
          wait = null
          return event.dblclick((d3.event as any).target.__data__)
        } else {
          event.click((d3.event as any).target.__data__)
          return (wait = window.setTimeout(
            (
              _e => () =>
                (wait = null)
            )(d3.event),
            250
          ))
        }
      }
    })
  }

  const event = d3.dispatch('click', 'dblclick')
  return d3.rebind(cc, event, 'on')
}

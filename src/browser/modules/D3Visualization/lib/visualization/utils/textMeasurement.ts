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

const measureUsingCanvas = function(text: any, font: any) {
  // @ts-expect-error ts-migrate(2683) FIXME: 'this' implicitly has type 'any' because it does n... Remove this comment to see the full error message
  const canvasSelection = d3.select('canvas#textMeasurementCanvas').data([this])
  canvasSelection
    .enter()
    .append('canvas')
    .attr('id', 'textMeasurementCanvas')
    .style('display', 'none')

  const canvas = canvasSelection.node() as HTMLCanvasElement
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.font = font
  return context.measureText(text).width
}

const cache = function() {
  const cacheSize = 10000
  const map: any = {}
  const list: any = []
  return (key: any, calc: any) => {
    const cached = map[key]
    if (cached) {
      return cached
    } else {
      const result = calc()
      if (list.length > cacheSize) {
        delete map[list.splice(0, 1)]
        list.push(key)
      }
      return (map[key] = result)
    }
  }
}

export default function(text: any, fontFamily: any, fontSize: any) {
  const font = `normal normal normal ${fontSize}px/normal ${fontFamily}`
  return cache()(text + font, () => measureUsingCanvas(text, font))
}

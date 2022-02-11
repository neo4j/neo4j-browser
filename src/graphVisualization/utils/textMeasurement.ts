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

const measureTextWidthByCanvas = (
  text: string,
  font: string,
  context: CanvasRenderingContext2D
): number => {
  context.font = font
  return context.measureText(text).width
}

const cacheTextWidth = function () {
  const CATCH_SIZE = 100000
  const textMeasureMap: { [key: string]: number } = {}
  const lruKeyList: string[] = []
  return (key: string, calculate: () => number) => {
    const cached = textMeasureMap[key]
    if (cached) {
      return cached
    } else {
      const result = calculate()
      if (lruKeyList.length > CATCH_SIZE) {
        delete textMeasureMap[lruKeyList.splice(0, 1).toString()]
        lruKeyList.push(key)
      }
      return (textMeasureMap[key] = result)
    }
  }
}

export function measureText(
  text: string,
  fontFamily: string,
  fontSize: number,
  canvas2DContext: CanvasRenderingContext2D
): number {
  const font = `normal normal normal ${fontSize}px/normal ${fontFamily}`
  return cacheTextWidth()(`[${font}][${text}]`, () =>
    measureTextWidthByCanvas(text, font, canvas2DContext)
  )
}
